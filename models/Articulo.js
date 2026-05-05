import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Articulos = db.define('ARTICULOS_PAGWEB_ISI', {
    ART_ID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    CATEGORIA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    LINEA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CLAVE_ARTICULO: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NOMBRE: {
        type: DataTypes.STRING(72),
        allowNull: false
    },
    PRECIO: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    EXISTENCIA_A: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    EXISTENCIA_T: {
        type: DataTypes.STRING(10),
        allowNull: false
<<<<<<< HEAD
    },
    IMPUESTO: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false
    }
}, {
    tableName: 'ARTICULOS_PAGWEB_ISI',
=======
    }
}, {
    tableName: 'ARTICULOS',
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
    freezeTableName: true,
    timestamps: false
})

export default Articulos
