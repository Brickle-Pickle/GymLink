require('dotenv').config();
const { connectDB, getDB, closeDB } = require('../config/database');

async function initializeUserStats() {
    try {
        console.log('Conectando a la base de datos...');
        await connectDB();
        
        const db = getDB();
        console.log('Conexión establecida');
        
        // Buscar usuarios que no tienen estadísticas o las tienen vacías
        const usersWithoutStats = await db.collection('users').find({
            $or: [
                { stats: { $exists: false } },
                { stats: null },
                { 'stats.totalWorkouts': { $exists: false } }
            ]
        }).toArray();
        
        console.log(`Encontrados ${usersWithoutStats.length} usuarios sin estadísticas`);
        
        if (usersWithoutStats.length === 0) {
            console.log('Todos los usuarios ya tienen estadísticas inicializadas');
            return;
        }
        
        // Actualizar cada usuario con estadísticas por defecto
        for (const user of usersWithoutStats) {
            console.log(`Inicializando estadísticas para usuario: ${user.username} (${user._id})`);
            
            await db.collection('users').updateOne(
                { _id: user._id },
                {
                    $set: {
                        stats: {
                            totalWorkouts: 0,
                            totalExercises: 0,
                            totalSets: 0,
                            totalWeight: 0,
                            streak: 0
                        }
                    }
                }
            );
            
            console.log(`✓ Estadísticas inicializadas para ${user.username}`);
        }
        
        console.log(`\n✅ Proceso completado. ${usersWithoutStats.length} usuarios actualizados.`);
        
    } catch (error) {
        console.error('Error al inicializar estadísticas:', error);
    } finally {
        await closeDB();
        console.log('Conexión cerrada');
    }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
    initializeUserStats();
}

module.exports = { initializeUserStats };