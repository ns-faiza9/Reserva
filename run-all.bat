@echo off
echo Starting all Reserva Services...

start cmd /k "cd Backend\coreservices && .\mvnw spring-boot:run"
start cmd /k "cd Backend\node-service && node index.js"
start cmd /k "cd resource-api && uvicorn main:app --port 8000 --reload"
start cmd /k "cd Frontend && npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Gateway: http://localhost:8000
echo Node JS: http://localhost:3000
echo Spring Boot: http://localhost:8080
