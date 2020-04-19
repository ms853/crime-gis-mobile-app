import { combineReducers } from 'redux';
import MapReducer from './MapReducer';
import ReportReducer from './ReportReducer';
import FetchReportReducer from './FetchReportReducer';

//set up combined reducer and
export default combineReducers({
    map: MapReducer,
    report: ReportReducer,
    fetchReport: FetchReportReducer
});