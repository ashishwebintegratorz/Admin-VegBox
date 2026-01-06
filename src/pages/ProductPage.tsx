import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ProductTable from "../components/tables/ProductTable";
import PageMeta from "../components/common/PageMeta";

export default function Products() {
  return (
    <>
      <PageMeta
        title="Products | VegBox Admin"
        description="Manage your vegetable and fruit inventory."
      />
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ProductTable />
      </div>
    </>
  );
}
