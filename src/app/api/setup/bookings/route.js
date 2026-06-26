import db from "@/lib/db";

export async function GET(req) {
  try {
    const connection = await db.getConnection();

    try {
      // Create bookings table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          service_id INT NOT NULL,
          booking_date DATE NOT NULL,
          complaint TEXT NOT NULL,
          status ENUM('pending', 'confirmed', 'done') NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
          INDEX idx_user_id (user_id),
          INDEX idx_service_id (service_id)
        )
      `);

      // Create services table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS services (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default services if they don't exist
      await connection.execute(`
        INSERT IGNORE INTO services (id, name, description) VALUES
        (1, 'Service Mesin', 'Servis mesin kendaraan'),
        (2, 'Ganti Oli', 'Pergantian oli mesin'),
        (3, 'Tune Up', 'Tune up mesin'),
        (4, 'Service Kelistrikan', 'Servis sistem kelistrikan'),
        (5, 'Ban & Rem', 'Servis ban dan rem')
      `);

      connection.release();

      return Response.json(
        { success: true, message: "Database tables created successfully" },
        { status: 200 }
      );
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Setup error:", error);
    return Response.json(
      { success: false, message: "Failed to setup database", error: error.message },
      { status: 500 }
    );
  }
}
