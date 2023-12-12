import {Report} from '../model/Report';

interface FetchReportProps {
  isAdmin?: boolean;
  uid?: string | null;
  onComplete: (reports: Report[]) => void;
}
export const fetchReport = ({
  isAdmin = false,
  uid,
  onComplete,
}: FetchReportProps) => {
  if (isAdmin) {
    // get all reports
    return Report.getAll(onComplete);
  }
  if (!isAdmin && uid) {
    // get reports by user
    return Report.getAllByReporterId(uid, onComplete);
  }
};
