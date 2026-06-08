import { all, fork } from "redux-saga/effects";
import { authSaga } from "@/store/modules/auth/authSaga";
import { userSaga } from "@/store/modules/user/userSaga";
import { clientsSaga } from "@/store/modules/clients/clientsSaga";
import { documentsSaga } from "@/store/modules/documents/documentsSaga";
import { meetingsSaga } from "@/store/modules/meetings/meetingsSaga";
import { proposalsSaga } from "@/store/modules/proposals/proposalsSaga";
import { legalSaga } from "@/store/modules/legal/legalSaga";
import { projectsSaga } from "@/store/modules/projects/projectsSaga";
import { financeSaga } from "@/store/modules/finance/financeSaga";
import { knowledgeSaga } from "@/store/modules/knowledge/knowledgeSaga";
import { proposalIntelligenceSaga } from "@/store/modules/proposalIntelligence/proposalIntelligenceSaga";

export default function* rootSaga() {
  yield all([fork(authSaga), fork(userSaga), fork(clientsSaga), fork(documentsSaga), fork(meetingsSaga), fork(proposalsSaga), fork(legalSaga), fork(projectsSaga), fork(financeSaga), fork(knowledgeSaga), fork(proposalIntelligenceSaga)]);
}
