const config = require("../config/config")

module.exports = function(sequelize, dataTypes) {
    let alias = "Cart";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: dataTypes.INTEGER,

        user_id: dataTypes.INTEGER,

        creation_date: dataTypes.DATE,

        date_of_purchase: dataTypes.DATE,

        state: dataTypes.STRING,

        total: dataTypes.INTEGER

    };

    let config = {
        tableName: "carts",
        timestamps: false

    }

    let Cart = sequelize.define(alias, cols, config);

    Cart.associate = function(models) {
        Cart.belongsTo(models.User, {
            as: "cart_user",
            foreignKey: "user_id"
        });

        Cart.belongsToMany(models.Product, {
            as: "products",
            through: "cart_product",
            foreignKey: cart_id,
            otherKey: product_id,
            timestamps: false
        });
        return Cart;
    }

}