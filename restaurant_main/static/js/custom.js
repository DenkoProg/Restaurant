let autocomplete;

function initAutoComplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('id_address'),
        {
            types: ['geocode', 'establishment'],
            //default in this app is "IN" - add your country code
            // componentRestrictions: {'country': ['in']},
        })
// function to specify what should happen when the prediction is clicked
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
    var place = autocomplete.getPlace();

    // User did not select the prediction. Reset the input field or alert()
    if (!place.geometry) {
        document.getElementById('id_address').placeholder = "Start typing...";
    } else {
        // console.log('place name=>', place.name)
    }

    // get the address components and assign them to the fields
    var geocoder = new google.maps.Geocoder()
    var address = document.getElementById('id_address').value


    geocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();

            $('#id_latitude').val(latitude);
            $('#id_longitude').val(longitude);

            $('#id_address').val(address);
        }
    });

    for (var i = 0; i < place.address_components.length; i++) {
        for (var j = 0; j < place.address_components[i].types.length; j++) {
            //get country
            if (place.address_components[i].types[j] == 'country') {
                $('#id_country').val(place.address_components[i].long_name);
            }
            //get state
            if (place.address_components[i].types[j] == 'administrative_area_level_1') {
                $('#id_state').val(place.address_components[i].long_name);
            }
            //get city
            if (place.address_components[i].types[j] == 'locality') {
                $('#id_city').val(place.address_components[i].long_name);
            }
            //get pincode
            if (place.address_components[i].types[j] == 'postal_code') {
                $('#id_pin_code').val(place.address_components[i].long_name);
            } else {
                $('#id_pin_code').val("");
            }
        }
    }
}


$(document).ready(function () {
    // add to cart
    $('.add_to_cart').on('click', function (e) {
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                if (response.status == 'login_required') {
                    Swal.fire(response.message, '', 'info')
                } else if (response.status == 'Failed') {
                    Swal.fire(response.message, '', 'error')
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count'])
                    $('#qty-' + food_id).html(response.qty)

                    // subtotal, tax and grand total
                    applyCartAmounts(response.cart_amount['subtotal'], response.cart_amount['tax'], response.cart_amount['grand_total'])
                }
            }
        })
    })

    // place the cart item quantity on load
    $('.item_qty').each(function () {
        var the_id = $(this).attr('id')
        var qty = $(this).attr('data-qty')
        $('#' + the_id).html(qty)
    })

    // decrease cart
    $('.decrease_cart').on('click', function (e) {
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');
        cart_id = $(this).attr('id')

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                if (response.status == 'login_required') {
                    Swal.fire(response.message, '', 'info')
                } else if (response.status == 'Failed') {
                    Swal.fire(response.message, '', 'error')
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count'])
                    $('#qty-' + food_id).html(response.qty)
                    if (window.location.pathname == '/cart/') {
                        removeCartItem(response.qty, cart_id)
                        checkEmptyCart();

                        // subtotal, tax and grand total
                        applyCartAmounts(response.cart_amount['subtotal'], response.cart_amount['tax'], response.cart_amount['grand_total'])
                    }
                }
            }
        })
    })

    // DELETE CART ITEM
    $('.delete_cart').on('click', function (e) {
        e.preventDefault();

        cart_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                if (response.status == 'login_required') {
                    Swal.fire(response.message, '', 'info')
                } else if (response.status == 'Failed') {
                    Swal.fire(response.message, '', 'error')
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count'])
                    Swal.fire(response.message, '', "success")

                    removeCartItem(0, cart_id)
                    checkEmptyCart();
                    // subtotal, tax and grand total
                    applyCartAmounts(response.cart_amount['subtotal'], response.cart_amount['tax'], response.cart_amount['grand_total'])
                }
            }
        })
    })


    // DELETE THE CART ELEMENT IF THE QTY IS 0
    function removeCartItem(cartItemQty, cart_id) {

        if (cartItemQty <= 0) {
            // remove the cart item element
            document.getElementById("cart-item-" + cart_id).remove()
        }

    }

    function checkEmptyCart() {
        var cart_counter = document.getElementById('cart_counter').innerHTML
        if (cart_counter == 0) {
            document.getElementById("empty-cart").style.display = "block";
        }
    }

    // apply cart amounts
    function applyCartAmounts(subtotal, tax, grand_total) {
        if (window.location.pathname == '/cart/') {
            $('#subtotal').html(subtotal)
            $('#tax').html(tax)
            $('#total').html(grand_total)
        }
    }

    $('.add_hour').on('click', function (e) {
        e.preventDefault();
        var day = document.getElementById('id_day').value
        var from_hour = document.getElementById('id_from_hour').value
        var to_hour = document.getElementById('id_to_hour').value
        var is_closed = document.getElementById('id_is_closed').checked
        var csrf_token = $('input[name=csrfmiddlewaretoken]').val()
        var url = document.getElementById('add_hour_url').value

        if (is_closed) {
            is_closed = 'True'
            condition = "day != ''"
        } else {
            is_closed = 'False'
            condition = "day != '' && from_hour!='' && to_hour!=''"
        }

        if (eval(condition)) {
            $.ajax({
                type: 'POST',
                url: url,
                data: {
                    'day': day,
                    'from_hour': from_hour,
                    'to_hour': to_hour,
                    'is_closed': is_closed,
                    'csrfmiddlewaretoken': csrf_token,
                },
                success: function (response) {
                    if (response.status == 'success') {
                        if (response.is_closed == 'Closed'){
                        html = '<tr><td style="border:none"><b>'+response.day+'</b></td><td style="border:none">Closed</td> <td style="border:none"><a class="remove_hour" data-url="/vendor/opening-hours/remove/'+response.id+'/" href="#">Remove</a></td></tr>'
                        }
                        else {
                        html = '<tr><td style="border:none"><b>'+response.day+'</b></td><td style="border:none">'+response.from_hour+' - ' + response.to_hour + '</td> <td style="border:none"><a href="#" class="remove_hour" data-url="/vendor/opening-hours/remove/'+response.id+'/">Remove</a></td></tr>'
                        }
                        $(".opening_hours").append(html)
                        document.getElementById("opening_hours").reset()}
                    else{
                        Swal.fire(response.message, '', "error")
                    }
                }
            })
        } else {
            Swal.fire('Please fill all the fields', '', 'info')
        }
    })


    $('.remove_hour').on('click', function (e){
        e.preventDefault();
        url = $(this).attr('data-url')
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                if (response.status == "success"){
                    document.getElementById('hour-'+response.id).remove()
                }
            }
        })
    })
    // document ready close
});
