const Sequelize = require('sequelize');
const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const db = require('../database/models');

const cartController = {

    addProductToCart: (req, res) => {
        if (req.session.usuarioLogueado) {
            var userId = req.session.usuarioLogueado.id;
        }
        console.log(req.body)
        var quantity = req.body.quantity;
        console.log(quantity);
        db.Product.findByPk(req.body.id)
            .then(function(addedProduct) {
                db.Cart.findOne({
                        include: ['carts'],
                        where: {
                            user_id: userId,
                            state: 1
                        }
                    })
                    .then(function(cart) {
                        if (cart == undefined) {
                            db.Cart.create({
                                    user_id: userId,
                                    creation_date: new Date(),
                                    state: 1
                                })
                                .then(function(cart) {
                                    console.log(cart)
                                    db.Cart_product.create({
                                            cart_id: cart.id,
                                            product_id: addedProduct.id,
                                            quantity: quantity,
                                            frozen_price: addedProduct.price
                                        })
                                        .then(function(cartProduct) {
                                            res.redirect('/#added')
                                        })
                                });
                        } else {
                            db.Cart_product.create({
                                    cart_id: cart.id,
                                    product_id: addedProduct.id,
                                    quantity: quantity,
                                    frozen_price: addedProduct.price - (addedProduct.price * (addedProduct.discount / 100))
                                })
                                .then(function(cartProduct) {
                                    res.redirect('/#added')
                                })
                        }
                    })
            })
    },

    showCart: (req, res) => {
        if (req.session.usuarioLogueado) {
            var userId = req.session.usuarioLogueado.id;
        }
        db.Cart.findOne({
                include: ['carts'],
                where: {
                    user_id: userId,
                    state: 1
                }
            })
            .then(function(cart) {
                let message = 'El carrito está vacio';
                if (cart == undefined) {
                    res.render('/products/cart', { message: message })
                    console.log(message);
                } else {
                    db.Cart_product.findAll({
                            include: [{ all: true, nested: true }],
                            where: {
                                cart_id: cart.id
                            }
                        })
                        .then(function(productCart) {
                            res.render('products/cart', {
                                productCart: productCart,
                                usuario: req.session.usuarioLogueado
                            })
                        })
                }
            })
    },

    destroyCartProduct: (req, res) => {
        db.Cart_product.destroy({
            where: {
                id: req.params.id
            }
        }).then(function() {
            res.redirect('/products/cart');
        })
    },

    checkOut: (req, res) => {
        if (req.session.usuarioLogueado) {
            var userId = req.session.usuarioLogueado.id;
        };
        db.Cart.findOne({
                include: ['carts'],
                where: {
                    user_id: userId,
                    state: 1
                }
            })
            .then(function(cart) {
                db.Cart_product.findAll({
                        include: [{ all: true, nested: true }],
                        where: {
                            cart_id: cart.id
                        }
                    })
                    .then(function(cartProduct) {
                        var quantityProd = cartProduct.length;
                        for (let i = 0; i < cartProduct.length; i++) {
                            var price = cartProduct[i].price;
                            var total = +price;
                            console.log(total)
                        };
                        db.Cart.update({
                                quantity: quantityProd,
                                date_of_purchase: new Date(),
                                state: 0,
                                total: total
                            }, {
                                where: {
                                    id: cart.id
                                }
                            })
                            .then(function(checkOut) {
                                console.log(checkOut)
                                res.render('/products/checkout', {
                                    usuario: req.session.usuarioLogueado
                                })
                            })
                    })
            })
    }

};

module.exports = cartController;