import React from 'react';
import './PolicePrintTemplate.css';

const PolicePrintTemplate = ({ data }) => {
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="police-print-form">
      <div className="print-header">
        <div className="kingdom-header">
          <p>ROYAUME DU MAROC</p>
          <p>DIRECTION GÉNÉRALE DE LA SÛRETÉ NATIONALE</p>
          <p>DIRECTION DE LA POLICE AUX FRONTIÈRES</p>
        </div>
        <div className="form-title">
          <h2>FICHE INDIVIDUELLE DE POLICE</h2>
          <p>(À remplir par toute personne logeant dans un établissement hôtelier)</p>
        </div>
      </div>

      <div className="print-content">
        <div className="print-row">
          <div className="field-box flex-2">
            <label>NOM / LAST NAME:</label>
            <span className="field-value">{data.nom || '........................................'}</span>
          </div>
          <div className="field-box flex-1">
            <label>PRÉNOM / FIRST NAME:</label>
            <span className="field-value">{data.prenom || '................................'}</span>
          </div>
        </div>

        <div className="print-row">
          <div className="field-box">
            <label>DATE DE NAISSANCE:</label>
            <span className="field-value">{data.dateNaissance || '..../..../.......'}</span>
          </div>
          <div className="field-box">
            <label>LIEU DE NAISSANCE:</label>
            <span className="field-value">{data.lieuNaissance || '................................'}</span>
          </div>
          <div className="field-box">
            <label>NATIONALITÉ:</label>
            <span className="field-value">{data.nationalite || '................................'}</span>
          </div>
        </div>

        <div className="print-row">
          <div className="field-box flex-2">
            <label>PROFESSION:</label>
            <span className="field-value">{data.profession || '........................................'}</span>
          </div>
          <div className="field-box flex-1">
            <label>DOMICILE HABITUEL:</label>
            <span className="field-value">{data.domicileHabituel || '................................'}</span>
          </div>
        </div>

        <div className="section-divider">PIÈCE D'IDENTITÉ / IDENTIFICATION</div>

        <div className="print-row">
          <div className="field-box">
            <label>TYPE (CNIE/PASSPORT):</label>
            <span className="field-value">{data.typeDocument || '................'}</span>
          </div>
          <div className="field-box">
            <label>NUMÉRO / NUMBER:</label>
            <span className="field-value">{data.numDocument || '........................'}</span>
          </div>
        </div>

        <div className="print-row">
          <div className="field-box">
            <label>DÉLIVRÉ LE:</label>
            <span className="field-value">{data.dateDelivrance || '..../..../.......'}</span>
          </div>
          <div className="field-box">
            <label>À (LIEU):</label>
            <span className="field-value">{data.lieuDelivrance || '................................'}</span>
          </div>
        </div>

        <div className="section-divider">SÉJOUR / STAY DETAILS</div>

        <div className="print-row">
          <div className="field-box">
            <label>DATE D'ARRIVÉE:</label>
            <span className="field-value">{data.dateArrivee || '..../..../.......'}</span>
          </div>
          <div className="field-box">
            <label>DURÉE PRÉVUE:</label>
            <span className="field-value">{data.dureeSejour || '....'} jours</span>
          </div>
        </div>

        <div className="print-row">
          <div className="field-box">
            <label>VENU DE (PROVENANCE):</label>
            <span className="field-value">{data.provenance || '................................'}</span>
          </div>
          <div className="field-box">
            <label>ALLANT À (DESTINATION):</label>
            <span className="field-value">{data.destination || '................................'}</span>
          </div>
        </div>

        <div className="print-row">
          <div className="field-box full">
            <label>MOTIF DU VOYAGE:</label>
            <span className="field-value">{data.motifVoyage || '................................'}</span>
          </div>
        </div>
      </div>

      <div className="print-footer">
        <div className="signature-area">
          <p>Signature du Client</p>
          <div className="sig-box"></div>
        </div>
        <div className="stamp-area">
          <p>Cachet de l'Établissement</p>
          <div className="sig-box"></div>
        </div>
      </div>

      <div className="print-date">Fait à ........................., le {today}</div>
    </div>
  );
};

export default PolicePrintTemplate;
