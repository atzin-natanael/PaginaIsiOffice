import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const cotizacion = db.define('DOCTOS_COT', {
    COTIZACION_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    CLIENTE_ID: { //FK
        type: DataTypes.INTEGER,
        allowNull: false
    },
    COSTO_TOTAL: { 
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
    },
    DESCRIPCION: { 
    type: DataTypes.STRING(200),
    allowNull: false
    },
    ESTATUS: {
        type: DataTypes.ENUM('PENDIENTE', 'CERRADA', 'VENCIDA', 'CANCELADA'),
        defaultValue: 'PENDIENTE'
    },
    FECHA_VENCIMIENTO:{
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true
})

export default cotizacion
