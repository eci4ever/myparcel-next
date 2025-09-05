import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: false }); // local = false, cloud db = 'require'

export default sql;