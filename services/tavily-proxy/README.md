# Local Tavily proxy

The proxy keeps `TAVILY_API_KEY` out of browser code and validates it through Tavily's `/usage` endpoint.

Endpoints:

- `GET /health` — current setup contract
- `GET /health/tavily` — compatibility contract for the 2-9 and 2-10 variants
- `POST /search` — capped basic search with sanitized results

Local configuration lives in ignored `.env.local`. `start.sh` loads it automatically.

Official references: [authentication](https://docs.tavily.com/documentation/api-reference/introduction), [usage](https://docs.tavily.com/documentation/api-reference/endpoint/usage), [search](https://docs.tavily.com/documentation/api-reference/endpoint/search).
