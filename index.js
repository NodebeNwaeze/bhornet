const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'DkmdTXc3ZCIxvHAasRIvzDBmWZT4gIpBJGT1a4hbPquYAtwIFxvzwVHp6YRlBe7y',
  APISECRET: '5sAojc4CqzjnuZKIR0BuvPkcMcRlfM1RJoe7emszHr1Sz8bIyV9QssFpFa0Dn5QV'
});

  var static_vars = {
    spendAmount:50,
    leverage:10,
    opendorder:false,
    expectedbnbusdt:0,
    expectedSpot_bnb_usdt:0,
    futures_orderID:""
  }

  var start = async function(){
    if(static_vars.opendorder){
      var futureprices = await binance.futuresPrices();
      var bnbusdt = futureprices.BNBUSDT;
      var spot_prices = await binance.prices('BNBUSDT');
      var spot_bnb_usdt = spot_prices.BNBUSDT; 
      if(bnbusdt >= static_vars.expectedbnbusdt || spot_bnb_usdt >= static_vars.expectedSpot_bnb_usdt){
        closeOrders();
      }
    }else{
      check_a_p_order();
    }
  }
  
  var check_a_p_order = async function(){
  try{
   var futureprices = await binance.futuresPrices();
   var bnbusdt = futureprices.BNBUSDT;
   var spot_prices = await binance.prices('BNBUSDT');
   var spot_bnb_usdt = spot_prices.BNBUSDT; 
   
    if((bnbusdt - spot_bnb_usdt) >= 1 || (spot_bnb_usdt - bnbusdt) >= 1){
      console.log(bnbusdt+" | "+spot_bnb_usdt);
      placeOrders(bnbusdt,spot_bnb_usdt);
    }

   }catch(e){
   console.log(e+" ----- erro geting BNBUSDT futures price or BNB/USDT spot price");
    }
    };

  var placeOrders = async function(bnbusdt,spot_bnb_usdt){
    var f_stake_amount = static_vars.spendAmount / static_vars.leverage;
    var levrageAdjust = await binance.futuresLeverage( 'BNBUSDT', static_vars.leverage );
    var futures_order = await binance.futuresMarketSell( 'BNBUSDT', Number( (f_stake_amount/bnbusdt).toPrecision(1) ) );
    static_vars.futures_orderID = futures_order.orderId;
    static_vars.opendorder = true;
    console.info( await binance.futuresBalance() );
    console.info(futures_order);
  }

  var closeOrders = async function(){
    console.log("Closing futures order \n-----------------------------------------------------------");
    console.info( await binance.futuresCancel( "BNBUSDT", {orderId: static_vars.futures_orderID} ) +"\n");
    console.log("-------------------------------------------------------------------");
    static_vars.opendorder = false;
  }
    start();