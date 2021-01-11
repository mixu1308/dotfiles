#!/usr/bin/env python3
#pip install cbpro
import sys
import cbpro

pc = cbpro.PublicClient()

icon = ""
request = pc.get_product_ticker(product_id='BTC-EUR')
local_price = "{:,}".format(round(float(request['price'])))
sys.stdout.write(f'{icon} {local_price}€  ')
