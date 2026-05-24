const fs = require('fs');

async function getSchema() {
  const res = await fetch('https://work-order-service-v5eg.onrender.com/v3/api-docs');
  const json = await res.json();
  const schema = json.components.schemas['MPMMonthlyPlanCreateRequest'];
  console.log(JSON.stringify(schema, null, 2));
}

getSchema().catch(console.error);
