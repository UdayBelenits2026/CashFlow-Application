// State shapes now live in the consolidated accounts model; re-exported here so
// existing store imports keep working.
export { accountsFeatureKey, initialAccountState } from '../../models/accounts.model';
export type { AccountState } from '../../models/accounts.model';
