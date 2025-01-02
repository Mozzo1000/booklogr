FROM python:3.12.4
WORKDIR /app

COPY README.md pyproject.toml manage.py ./
COPY src ./src

RUN pip install .

CMD ["python", "manage.py", "listen"] 