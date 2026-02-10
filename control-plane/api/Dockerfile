FROM python:3.14.3-alpine

WORKDIR /app

COPY src/server.py /app/server.py

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["python", "/app/server.py"]
