import React from 'react';
import './PolicePrintTemplate.css';

const PolicePrintTemplate = ({ data }) => {
  const today = new Date().toLocaleDateString('fr-MA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div id="police-print-area" className="ppt-wrapper">
      <div className="ppt-doc">

        {/* ── EN-TÊTE ────────────────────────────── */}
        <div className="ppt-header">
          <div className="ppt-header-left">
            <div className="ppt-seal">
              <div className="ppt-seal-star">★</div>
              <div className="ppt-seal-ring" />
            </div>
          </div>
          <div className="ppt-header-center">
            <p className="ppt-kingdom-ar">المملكة المغربية</p>
            <p className="ppt-kingdom-fr">ROYAUME DU MAROC</p>
            <p className="ppt-ministry">Ministère de l'Intérieur · Direction Générale de la Sûreté Nationale</p>
            <h1 className="ppt-form-title">FICHE INDIVIDUELLE D'HÉBERGEMENT</h1>
            <p className="ppt-form-title-ar">فيش الإيواء الفردي</p>
          </div>
          <div className="ppt-header-right">
            <div className="ppt-ref-box">
              <div className="ppt-ref-label">Réf. DGSN</div>
              <div className="ppt-ref-val">DG-{Date.now().toString().slice(-7)}</div>
            </div>
            <div className="ppt-ref-box">
              <div className="ppt-ref-label">Date</div>
              <div className="ppt-ref-val">{today}</div>
            </div>
          </div>
        </div>

        <div className="ppt-divider" />

        {/* ── SECTION 1 : ÉTAT CIVIL ───────────── */}
        <div className="ppt-section">
          <div className="ppt-section-title">1 — ÉTAT CIVIL <span className="ppt-ar">/ البيانات الشخصية</span></div>
          <div className="ppt-grid-4">
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Nom / اللقب</div>
              <div className="ppt-field-val ppt-bold">{data.nom || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Prénom / الاسم</div>
              <div className="ppt-field-val ppt-bold">{data.prenom || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Date de naissance / تاريخ الازدياد</div>
              <div className="ppt-field-val">{data.dateNaissance || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Lieu de naissance / مكان الازدياد</div>
              <div className="ppt-field-val">{data.lieuNaissance || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Nationalité / الجنسية</div>
              <div className="ppt-field-val">{data.nationalite || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Profession / المهنة</div>
              <div className="ppt-field-val">{data.profession || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-2">
              <div className="ppt-field-label">Domicile habituel / عنوان السكن المعتاد</div>
              <div className="ppt-field-val">{data.domicileHabituel || '\u00a0'}</div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 : PIÈCE D'IDENTITÉ ──────── */}
        <div className="ppt-section">
          <div className="ppt-section-title">2 — PIÈCE D'IDENTITÉ <span className="ppt-ar">/ وثيقة الهوية</span></div>
          <div className="ppt-grid-4">
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Type de document / نوع الوثيقة</div>
              <div className="ppt-field-val">{data.typeDocument || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">N° du document / رقم الوثيقة</div>
              <div className="ppt-field-val ppt-mono ppt-bold">{data.numDocument || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Délivrée le / تاريخ الإصدار</div>
              <div className="ppt-field-val">{data.dateDelivrance || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Lieu de délivrance / مكان الإصدار</div>
              <div className="ppt-field-val">{data.lieuDelivrance || '\u00a0'}</div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3 : SÉJOUR ───────────────── */}
        <div className="ppt-section">
          <div className="ppt-section-title">3 — DÉTAILS DU SÉJOUR <span className="ppt-ar">/ تفاصيل الإقامة</span></div>
          <div className="ppt-grid-4">
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Date d'arrivée / تاريخ الوصول</div>
              <div className="ppt-field-val">{data.dateArrivee || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Durée du séjour / مدة الإقامة (jours)</div>
              <div className="ppt-field-val">{data.dureeSejour || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Provenance / قادم من</div>
              <div className="ppt-field-val">{data.provenance || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-1">
              <div className="ppt-field-label">Destination / متجه إلى</div>
              <div className="ppt-field-val">{data.destination || '\u00a0'}</div>
            </div>
            <div className="ppt-field ppt-col-2">
              <div className="ppt-field-label">Motif du voyage / سبب السفر</div>
              <div className="ppt-field-val">{data.motifVoyage || '\u00a0'}</div>
            </div>
          </div>
        </div>

        {/* ── SIGNATURES ───────────────────────── */}
        <div className="ppt-signatures">
          <div className="ppt-sig-box">
            <div className="ppt-sig-label">Signature de l'hébergé / توقيع النزيل</div>
            {data.signature ? (
              <img src={data.signature} alt="signature" className="ppt-sig-img" />
            ) : (
              <div className="ppt-sig-area" />
            )}
          </div>
          <div className="ppt-sig-box">
            <div className="ppt-sig-label">Cachet & Signature du responsable de l'hébergement / ختم المؤسسة</div>
            <div className="ppt-sig-area" />
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────── */}
        <div className="ppt-footer">
          <div className="ppt-footer-legal">
            <strong>⚠</strong> Conformément à la circulaire n°105 du Ministère de l'Intérieur — Obligation de
            télétransmission à la DGSN dans les 24h suivant l'hébergement.
            &nbsp;|&nbsp; وفقا للمنشور رقم 105 لوزارة الداخلية
          </div>
          <div className="ppt-barcode-area">
            <div className="ppt-barcode">
              ||||| || ||| || |||| || ||| |||| ||| || |||
            </div>
            <div className="ppt-barcode-num">
              DGSN-{(data.numDocument || '000000').replace(/\s/g, '')}-{(data.dateArrivee || '00000000').replace(/-/g, '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicePrintTemplate;
