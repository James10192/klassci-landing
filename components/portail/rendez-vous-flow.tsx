"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Carte, champ, dateNaissanceValide } from "./pieces";

type Ecole = { code: string; libelle: string };

type Creneau = {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  etat: "disponible" | "complet";
};

type Reservation = {
  date: string;
  heure_debut: string;
  heure_fin: string;
  statut: string;
};

export function RendezVousFlow({
  etablissement,
  referenceInitiale,
}: {
  etablissement: Ecole;
  referenceInitiale?: string;
}) {
  const t = useTranslations("inscription.rdv");
  const [reference, setReference] = useState(referenceInitiale ?? "");
  const [jour, setJour] = useState("");
  const [mois, setMois] = useState("");
  const [annee, setAnnee] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [peutModifier, setPeutModifier] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const naissance = `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`;
  const naissanceOk = dateNaissanceValide(jour, mois, annee);

  const chargerCreneaux = useCallback(async () => {
    const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/creneaux`, { method: "POST" });
    const corps = await reponse.json().catch(() => null);
    if (reponse.ok && corps && Array.isArray(corps.creneaux)) {
      setCreneaux(corps.creneaux);
    }
  }, [etablissement.code]);

  useEffect(() => {
    void chargerCreneaux();
  }, [chargerCreneaux]);

  async function consulter() {
    if (!naissanceOk || reference.trim() === "" || enCours) return;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/consulter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.trim(), date_naissance: naissance }),
      });
      const corps = await reponse.json().catch(() => null);
      if (corps?.trouve === true) {
        setReservation(corps.reservation);
        setPeutModifier(Boolean(corps.peut_modifier));
      } else {
        setReservation(null);
      }
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function retrouver() {
    if (!naissanceOk || identifiant.trim() === "" || enCours) return;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/retrouver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant: identifiant.trim(), date_naissance: naissance }),
      });
      const corps = await reponse.json().catch(() => null);
      if (corps?.trouve === true && typeof corps.reference === "string") {
        setReference(corps.reference);
      } else {
        setErreur("introuvable");
      }
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function reserver(creneauId: number) {
    if (!naissanceOk || reference.trim() === "" || enCours) return;
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/reserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim(),
          date_naissance: naissance,
          creneau_id: creneauId,
        }),
      });
      const corps = await reponse.json().catch(() => null);
      if (reponse.status === 201 && corps?.reservation) {
        setReservation(corps.reservation);
        setPeutModifier(true);
        return;
      }
      if (Array.isArray(corps?.creneaux)) {
        setCreneaux(corps.creneaux);
      }
      setErreur(typeof corps?.code === "string" ? corps.code : "indisponible");
    } catch {
      setErreur("indisponible");
    } finally {
      setEnCours(false);
    }
  }

  async function annuler() {
    if (!naissanceOk || reference.trim() === "" || enCours) return;
    setEnCours(true);
    try {
      const reponse = await fetch(`/api/rendez-vous/${etablissement.code}/annuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.trim(), date_naissance: naissance }),
      });
      if (reponse.ok) {
        setReservation(null);
        await chargerCreneaux();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Carte>
      <label className="block text-sm font-medium">
        {t("reference")}
        <input className={champ} value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />
      </label>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <input className={champ} inputMode="numeric" placeholder={t("jour")} value={jour} onChange={(e) => setJour(e.target.value)} />
        <input className={champ} inputMode="numeric" placeholder={t("mois")} value={mois} onChange={(e) => setMois(e.target.value)} />
        <input className={champ} inputMode="numeric" placeholder={t("annee")} value={annee} onChange={(e) => setAnnee(e.target.value)} />
      </div>

      <button
        type="button"
        onClick={() => void consulter()}
        disabled={enCours || !naissanceOk || reference.trim() === ""}
        className="mt-4 min-h-[44px] w-full rounded-xl bg-accent px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {t("voir")}
      </button>

      <p className="mt-4 text-xs text-text-muted">{t("retrouverAide")}</p>
      <input
        className={champ}
        value={identifiant}
        onChange={(e) => setIdentifiant(e.target.value)}
        placeholder={t("identifiant")}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => void retrouver()}
        disabled={enCours || !naissanceOk || identifiant.trim() === ""}
        className="mt-2 min-h-[40px] text-sm text-accent underline-offset-4 hover:underline disabled:opacity-50"
      >
        {t("retrouver")}
      </button>

      {erreur !== null && (
        <p className="mt-4 text-sm text-text-secondary">
          {erreur === "introuvable" || erreur === "complet" || erreur === "deja_reserve" || erreur === "trop_tot" || erreur === "ferme"
            ? t(`erreurs.${erreur}`)
            : t("erreurs.indisponible")}
        </p>
      )}

      {reservation !== null && (
        <div className="mt-6 rounded-xl bg-bg-alt p-4">
          <p className="text-sm font-semibold">{t("confirme")}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {reservation.date} · {reservation.heure_debut} – {reservation.heure_fin}
          </p>
          {peutModifier && (
            <button type="button" onClick={() => void annuler()} className="mt-3 text-sm text-accent underline">
              {t("annuler")}
            </button>
          )}
        </div>
      )}

      {reservation === null && (
        <ul className="mt-6 space-y-2">
          {creneaux.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
              <span className="text-sm">
                {c.date} · {c.heure_debut} – {c.heure_fin}
              </span>
              {c.etat === "disponible" ? (
                <button
                  type="button"
                  onClick={() => void reserver(c.id)}
                  disabled={enCours || !naissanceOk || reference.trim() === ""}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {t("choisir")}
                </button>
              ) : (
                <span className="text-xs text-text-muted">{t("complet")}</span>
              )}
            </li>
          ))}
          {creneaux.length === 0 && <li className="text-sm text-text-muted">{t("aucun")}</li>}
        </ul>
      )}
    </Carte>
  );
}
