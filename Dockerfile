FROM python:3.14.6-slim AS build
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY api ./api

RUN pip install --no-cache-dir .

FROM python:3.14.6-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system app \
    && adduser --system --ingroup app --home /home/app app \
    && mkdir -p /home/app \
    && chown app:app /home/app

COPY --from=build /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
COPY --from=build /usr/local/bin /usr/local/bin
COPY --from=build /app/api ./api
COPY migrations ./migrations
COPY entrypoint.sh ./

ENV PYTHONUNBUFFERED=1 \
    HOME=/home/app \
    FLASK_APP=api.app \
    FLASK_ENV=production

RUN chmod +x entrypoint.sh \
    && chown -R app:app /app

USER app

EXPOSE 5000
ENTRYPOINT ["/app/entrypoint.sh"]