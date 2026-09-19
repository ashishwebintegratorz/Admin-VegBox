import { useEffect, useState } from 'react';
import { issueService } from '../services/api';

interface Issue {
  _id: string;
  order: {
    _id: string;
    orderNumber: string;
    payableAmount: number;
    deliveryStatus: string;
  };
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  description: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

const ReportManagement = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssues();
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await issueService.resolveIssue(id);
      if (res.data.success) {
        setIssues(issues.map(issue => 
          issue._id === id ? { ...issue, status: 'resolved' } : issue
        ));
      }
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Reports & Issues
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Order Info
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  User Info
                </th>
                <th className="min-w-[300px] py-4 px-4 font-medium text-black dark:text-white">
                  Issue Description
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Loading issues...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No issues reported yet.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white font-semibold">
                        {issue.order?.orderNumber || 'N/A'}
                      </p>
                      <p className="text-sm">
                        Amount: ₹{issue.order?.payableAmount}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {issue.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm">{issue.user?.phone}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white text-sm whitespace-pre-wrap">
                        {issue.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(issue.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          issue.status === 'resolved'
                            ? 'bg-success text-success'
                            : 'bg-warning text-warning'
                        }`}
                      >
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      {issue.status === 'open' && (
                        <button
                          onClick={() => handleResolve(issue._id)}
                          className="rounded bg-primary py-1 px-3 text-sm text-white hover:bg-opacity-90 transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReportManagement;
