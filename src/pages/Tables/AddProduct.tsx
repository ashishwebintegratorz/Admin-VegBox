import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddProductTableOne from "../../components/tables/BasicTables/AddProductTableOne";

export default function AddProductsPage() {
  return (
    <>
      <PageMeta title="Add Products" description="Manage products" />
      <PageBreadcrumb pageTitle="Products" />

      <div className="space-y-6">
        <ComponentCard title="Products List">
          <AddProductTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
