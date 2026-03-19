export interface ActiveTabStatus {
  canInsert: boolean;
  reason: string;
  tabTitle: string;
}

export interface ActiveTabStatusPortMessage {
  type: 'ACTIVE_TAB_STATUS';
  payload: ActiveTabStatus;
}

export interface CloseSidepanelPortMessage {
  type: 'CLOSE_SIDEPANEL';
}

export type SidepanelPortMessage =
  | ActiveTabStatusPortMessage
  | CloseSidepanelPortMessage;
