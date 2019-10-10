import { readFileSync, writeFileSync } from 'fs';
import program from 'commander';
import { safeLoad, safeDump } from 'js-yaml';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DateTime } from 'luxon';
import pdf from 'html-pdf';
import inquirer from 'inquirer';
import colors from 'colors';
import rc from 'rc';

import { displayItems } from '../utils';
import Invoice from './Invoice';

function fromYaml(file) {
  return safeLoad(readFileSync(file), 'utf8');
}

const provider = fromYaml('./data/provider.yaml');
const clients = fromYaml('./data/clients.yaml');
const items = fromYaml('./data/items.yaml');
const invoices = fromYaml('./data/invoices.yaml') || [];

program
  .version('0.1.0')
  .option('-d, --debug', 'Debug mode')
  .parse(process.argv);

inquirer
.prompt([{
  type: 'list',
  name: 'client',
  message: 'What is the client?',
  choices: Object.values(clients).map(client => ({
    name: client.name,
    value: client.code
  })),
  filter: code => clients[code]
}, {
  type: 'confirm',
  name: 'ok',
  message: () => {
    displayItems(items);
    return 'Is this ok?';
  },
  default: true,
  filter: code => clients[code]
}])
.then(({ client, ok }) => {
  if (!ok) return;

  const dateArray = DateTime.local().toISO().split('T')[0].split('-');

  const id = invoices.length + 1;
  const number = invoices.reduce((acc, invoice) => {
    if (invoice.clientCode === client.code)
      return acc + 1;
    return acc;
  }, 1);

  const label = [...dateArray.slice(0, 2), client.code, `F${number}`].join('_');

  console.log();
  console.log(`Generating invoice #${id}, ${label.bold}...`);

  const html = readFileSync('./base.html');

  const invoice = {
    id,
    label,
    date: dateArray.reverse().join('/'),
    clientCode: client.code,
    priceHT: items.reduce((acc, { unitPrice, quantity }) => acc + unitPrice * quantity, 0)
  };

  invoices.push(invoice);

  const dom = new JSDOM(html, { resources: 'usable' });
  const document = dom.window.document;

  document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <Invoice provider={provider} items={items} client={client} invoice={invoice} />
  );

  var options = {
    format: 'A4',
    // footer: {
    //   contents: {
    //     height: '10px',
    //     default: ReactDOMServer.renderToStaticMarkup(<Footer provider={provider} invoice={invoice} />),
    //   }
    // },
  };

  writeFileSync('./build/index.html', dom.serialize());

  if (!program.debug)
    writeFileSync('./data/invoices.yaml', safeDump(invoices));

  const dir = program.debug ? '.' : rc('facture').outputDir;

  pdf.create(dom.serialize(), options).toFile(`${dir}/${label}.pdf`, function (err, res) {
    if (err) return console.log(err);
    console.log(res.filename.green);
  });
});