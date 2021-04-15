const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'DkmdTXc3ZCIxvHAasRIvzDBmWZT4gIpBJGT1a4hbPquYAtwIFxvzwVHp6YRlBe7y',
  APISECRET: '5sAojc4CqzjnuZKIR0BuvPkcMcRlfM1RJoe7emszHr1Sz8bIyV9QssFpFa0Dn5QV'
});

  var static_vars = {
    spendAmount:70,
    leverage:10,
    opendorder:false,
    expectedbnbusdt:0,
    expectedSpot_bnb_usdt:0,
    futures_orderID:"",
    purchase_spot_quantity:0,
    pair:"BNBUSDT"
  }

  var start = async function(){
    if(static_vars.opendorder){

      var futureprices = await binance.futuresPrices();
      var bnbusdt = futureprices.BNBUSDT;
      var spot_prices = await binance.prices(static_vars.pair);
      var spot_bnb_usdt = spot_prices.BNBUSDT; 

      var prev_order = await binance.futuresOrderStatus( static_vars.pair, {orderId: static_vars.futures_orderID} ) 
      console.log(prev_order);
      if(bnbusdt >= static_vars.expectedbnbusdt){
        closebnbusdtOrder();
      }else if(spot_bnb_usdt >= static_vars.expectedSpot_bnb_usdt){
        closespot_bnb_usdtOrder();
      }
    }else{
      check_a_p_order();
    }
  }
  
  var check_a_p_order = async function(){
  try{
   var futureprices = await binance.futuresPrices();
   var bnbusdt = futureprices.BNBUSDT;
   var spot_prices = await binance.prices(static_vars.pair);
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
    var final_f_stake_amount = Number( (f_stake_amount/bnbusdt).toPrecision(1) );
    var spot_stake_amount = Number( (static_vars.spendAmount/spot_bnb_usdt).toPrecision(1) );

    var spot_order = binance.marketBuy(static_vars.pair, spot_stake_amount);
    static_vars.purchase_spot_quantity = spot_stake_amount;
    var futures_order = await binance.futuresMarketSell( static_vars.pair, final_f_stake_amount);
    static_vars.futures_orderID = futures_order.orderId;
    static_vars.opendorder = true;
    console.info( final_f_stake_amount );
    console.info(futures_order);
  }

  var closespot_bnb_usdtOrder = async function(){
    console.log("Closing spot order \n-----------------------------------------------------------");
    console.info( await binance.marketSell(static_vars.pair, static_vars.purchase_spot_quantity) +"\n");
    console.log("spot order closed successfully-------------------------------------------------------------------");
    static_vars.opendorder = false;
  }

  var closebnbusdtOrder = async function(){
    console.log("Closing futures order \n-----------------------------------------------------------");
    console.info( await binance.futuresCancel( static_vars.pair, {orderId: static_vars.futures_orderID} ) +"\n");
    console.log("futures order closed successfully-------------------------------------------------------------------");
    static_vars.opendorder = false;
  }

  var acc_setup = async function(){
    var levrageAdjust = await binance.futuresLeverage( static_vars.pair, static_vars.leverage );
  }

    acc_setup();
    setInterval(start, 3000);