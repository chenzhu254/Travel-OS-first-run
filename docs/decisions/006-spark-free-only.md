# ADR-006: Spark-only setup and keyless Maps

Status: Accepted (2026-10-09). Supersedes ADR-005.

The product must be usable without payment information or paid-service setup. Keep Firebase Email/password Authentication and Realtime Database with server-enforced membership Rules on Spark, and IndexedDB plus JSON backups. Spark has finite quotas; do not promise unlimited cloud availability or infer billing status from successful login.

Remove Browser Key entry, Places loading, callable Functions and their deployment command. Legacy remembered keys are discarded without losing Firebase settings. Replace in-app route calculations with keyless external Google Maps driving and walking links. Remove all weather features, including external weather search. No new paid service or replacement provider is introduced.

Existing billing or previously deployed resources belong to the user and are not changed automatically. Historical verification reports describe earlier behavior; the current product acceptance baseline is this decision.
