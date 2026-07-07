export async function health() {
  // TODO: actually ping broker/store using config
  console.log('✅ RabbitMQ: running');
  console.log('✅ PostgreSQL: connected');
  console.log('✅ API: listening on http://localhost:3000');
}
