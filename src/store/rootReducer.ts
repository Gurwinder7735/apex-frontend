import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/store/modules/auth/authSlice";
import userReducer from "@/store/modules/user/userSlice";
import clientsReducer from "@/store/modules/clients/clientsSlice";
import documentsReducer from "@/store/modules/documents/documentsSlice";
import meetingsReducer from "@/store/modules/meetings/meetingsSlice";
import proposalsReducer from "@/store/modules/proposals/proposalsSlice";
import legalReducer from "@/store/modules/legal/legalSlice";
import projectsReducer from "@/store/modules/projects/projectsSlice";
import financeReducer from "@/store/modules/finance/financeSlice";
import knowledgeReducer from "@/store/modules/knowledge/knowledgeSlice";
import proposalIntelligenceReducer from "@/store/modules/proposalIntelligence/proposalIntelligenceSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  clients: clientsReducer,
  documents: documentsReducer,
  meetings: meetingsReducer,
  proposals: proposalsReducer,
  legal: legalReducer,
  projects: projectsReducer,
  finance: financeReducer,
  knowledge: knowledgeReducer,
  proposalIntelligence: proposalIntelligenceReducer,
});

export default rootReducer;
