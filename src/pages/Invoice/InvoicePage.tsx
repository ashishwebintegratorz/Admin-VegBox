import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InvoiceTable from "../../components/tables/InvoiceTable";

export default function InvoicePage() {
  return (
    <>
      <PageMeta
        title="Invoices | VegBox Admin"
        description="Manage your business invoices efficiently."
      />
      <PageBreadcrumb pageTitle="Invoices" />
      <div className="space-y-6">
        <InvoiceTable />
      </div>
    </>
  );
}
