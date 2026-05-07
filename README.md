# Tive Client App

Angular frontend for `tive-query` that:

- calls `tive-query` tracker endpoints,
- authenticates with `X-Api-Key`,
- renders tracker positions on Google Maps,
- deploys to GCP (same project as `tive-query`) using Cloud Build + Cloud Run.

## API Integration

This app reads tracker data from:

- `GET /api/v1/trackers`

Expected backend source: `/home/bat/projects/java/tive-query`.

## Environment Variables

The production bundle uses placeholders replaced at container startup:

- `TIVE_QUERY_BASE_URL`
- `TIVE_QUERY_API_KEY`
- `GOOGLE_MAPS_API_KEY`

Local defaults are in `src/environments/environment.development.ts`.

## Local Run

1. Start `tive-query` locally (default in its README: `http://localhost:8081`).
2. Set a valid Maps API key in `src/environments/environment.development.ts`.
3. Run the UI.

```bash
npm install
npm start
```

Then open `http://localhost:4200`.

## Test and Build

```bash
npm run test:ci
npm run build:prod
```

## Container Run

```bash
docker build -t tive-client:local .
docker run --rm -p 8080:8080 \
  -e TIVE_QUERY_BASE_URL="http://host.docker.internal:8081" \
  -e TIVE_QUERY_API_KEY="local-dev-key" \
  -e GOOGLE_MAPS_API_KEY="your-google-maps-key" \
  tive-client:local
```

## Deploy to GCP (Same Project as `tive-query`)

`cloudbuild.yaml` deploys to Cloud Run service `tive-client` and expects secrets in Secret Manager:

- `TIVE_QUERY_API_KEY`
- `GOOGLE_MAPS_API_KEY`

Example trigger command:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_REPOSITORY=tive-repo,_SERVICE_NAME=tive-client,_TIVE_QUERY_BASE_URL=https://YOUR_TIVE_QUERY_URL
```

## Notes

- `tive-query` must allow browser-origin calls from the frontend URL (CORS).
- `tive-query` requires `X-Api-Key` on API requests.
