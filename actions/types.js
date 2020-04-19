//https://www.udemy.com/the-complete-react-native-and-redux-course/learn/lecture/5870390#overview
//A set of constant variables that will be used to identify the action types. 

///------------Action Types for reporting crimes--------------/////
export const REPORT_USER_CRIME = "report_crime_of_registered_user";
export const REPORT_CRIME_ANONYMOUSLY = "report_crime_as_an_anonymous_user";
export const REPORT_CRIME_FAIL = "reporting_failed";
export const REPORT_CRIME_SUCCESS = "crime_successfully_reported";

///--------Action Types for reporting retrieving the list of crimes---///
export const GET_LIST_OF_CRIME_REPORTS = "get_list_of_crime_reports";
export const GET_LIST_OF_CRIME_REPORTS_FAILED = "failed_to_retrieve_user's_crime_reports";
export const GET_CRIME_REPORT_LIST_SUCCESS = "successfully_retrieved_the_users_ crime_repots_from_the_backend_database";

///---------Action Types for updating & deleting crime reports ----////
export const UPDATE_CRIME_REPORT = "updatting_crime_report";
export const DELETE_CRIME_REPORT = "deleting_crime_report";
export const OFFLINE_SEARCH_REPORT_LIST = "search_user_crime_reports_locally";


///--------Action types for Getting user information------////
export const GET_USERID = "requesting__and_getting_user_id";
export const GET_USER_ADDRESS = "get_user_address";

////----For tracking the changes in the report form -----/////
export const REPORT_INPUT_CHANGED = "report_input_changed";

///------------For form validation ----------/////
export const INVALID_EMAIL = "email_is_not_valid";
export const VALID_EMAIL = "email_is_valid";
export const GET_USERNAME = "get_the_username_of_current_user";
export const REPORT_EMAIL_CHANGED = "email_value_changed"; 

///---------Types for the Map Component --------------/////
export const RENDER_OFFLINE_MARKERS = "display_markers_offline";
export const SEARCH_CRIMES = "search_crimes";
export const CRIMES_FOUND = "found_crimes_that_match_to_users_search_request";
export const CRIME_NOT_FOUND = "unable_to_find_crime_matching_the_search";
export const SEARCH_QUERY_CHANGED = "search_input_changed";
export const DOWNLOAD_CRIMES = "download_crimes";
export const GET_ALL_CRIMES_IN_CUSTOM_AREA = "get_all_the_crimes_in_a_fixed_area_in_leicestershire";
export const MAP_NUMBER_PICKER_CHANGED = "picker_value_has_changed";
export const GET_DIRECTIONS = "request_to_get_direction_to_a_particular_destination";

export const MAP_INPUT_CHANGED = "map_input_changed";
