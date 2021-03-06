import React from 'react';

import { docType } from '../utils';

const Payment = ({ bank, iban, bic, type }) => {
  const isInvoice = type === docType.invoice;

  return (
    <section className='payment'>
      <h2 className={type}>Conditions de paiement</h2>
      <div className='conditions'>
        {`À réception de la ${
          isInvoice ? 'présente' : ''
        } facture, par virement aux coordonnées
        bancaires suivantes:`}
      </div>
      <div className='bankDetails'>
        <div className='name'>{bank}</div>
        <div className='iban'>
          <span>IBAN</span>
          {iban}
        </div>
        <div className='bic'>
          <span>BIC</span>
          {bic}
        </div>
      </div>
      <div className='delay'>
        Tout paiement différé entraîne l'application d'un intérêt de retard au
        taux de 15% annuel et d'une indemnité forfaitaire de 40 €. Le paiement
        anticipé ne donne droit à aucun escompte. Les acomptes facturés ne sont
        pas des arrhes et ne permettent pas de renoncer au marché.
      </div>
    </section>
  );
};

export default Payment;
