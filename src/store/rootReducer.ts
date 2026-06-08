import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/store/modules/auth/authSlice";
import userReducer from "@/store/modules/user/userSlice";
import clientsReducer from "@/store/modules/clients/clientsSlice";
import proposalsReducer from "@/store/modules/proposals/proposalsSlice";
import projectsReducer from "@/store/modules/projects/projectsSlice";
import proposalIntelligenceReducer from "@/store/modules/proposalIntelligence/proposalIntelligenceSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  clients: clientsReducer,
  proposals: proposalsReducer,
  projects: projectsReducer,
  proposalIntelligence: proposalIntelligenceReducer,
});

export default rootReducer;
