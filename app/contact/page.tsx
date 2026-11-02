import type { Metadata } from "next";
import { BUSINESS, fullAddress } from "@/lib/business";
import { F, LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <LegalPage title="Contact us" updated={false}>
      <p>For help with a listing, a payment, an invoice or a refund, write to us. Please include your payment ID (it starts with <code>pay_</code>) if your question is about a payment.</p>
      <div className="box">
        <dl>
          <dt>Business name</dt><dd>{BUSINESS.legalName}</dd>
          <dt>Website</dt><dd>eknumber.in</dd>
          <dt>Address</dt><dd>{fullAddress()}</dd>
          <dt>Email</dt><dd>{BUSINESS.email}</dd>
          <dt>Phone</dt><dd><F v={BUSINESS.phone} /></dd>
          <dt>GSTIN</dt><dd><F v={BUSINESS.gstin} /></dd>
          <dt>Support hours</dt><dd>{BUSINESS.supportHours}</dd>
        </dl>
      </div>
      <h2>Grievance officer</h2>
      <p>Under the Consumer Protection (E-Commerce) Rules, 2020 and the Digital Personal Data Protection Act, 2023, you can raise a complaint with our grievance officer:</p>
      <div className="box">
        <dl>
          <dt>Name</dt><dd><F v={BUSINESS.grievanceOfficer} /></dd>
          <dt>Email</dt><dd>{BUSINESS.email}</dd>
          <dt>Address</dt><dd>{fullAddress()}</dd>
        </dl>
      </div>
      <p>We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>
    </LegalPage>
  );
}
