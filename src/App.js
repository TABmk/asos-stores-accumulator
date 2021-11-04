import React, { useState } from 'react';
import './App.css';
import { Grid, Row, Col } from 'react-flexbox-grid';
import STORES from './stores.json'

const url = 'https://www.asos.com/api/product/search/v2/categories/7368';

function App() {
  const [items, setItems] = useState({});

  const getFromStore = async (i, lim, offset = 0) => {
    const req = await fetch(url + `?country=${STORES[i].country}&currency=${STORES[i].currency}&lang=${STORES[i].lang}&limit=${lim}&offset=${offset}&store=${STORES[i].store}`);
    const data = await req.json();

    data.products.forEach(e => {
      if (!items[e.id]) {
        items[e.id] = {
          name: e.name,
          imageUrl: e.imageUrl,
          price: [],
        }
      }

      if (e.price.current) {
        items[e.id].price.push({
          store: STORES[i].store,
          country: STORES[i].country,
          value: e.price.current.value,
          text: e.price.current.text,
        })
      }
      setItems(items);
    });
  }

  for (let i = 0; i < STORES.length; i += 1) {
    getFromStore(i, 200)
  }

  return (
  <div>
    <Grid fluid className="container">
      <Row>
        {
          Object.keys(items).map((e) => (
            <Col key={items + Math.random()} xs={12} md={6} lg={3}>
            <div className="prd">
              <img alt="" className="prd_img" src={'https://' + items[e].imageUrl} />
              <div className="prd_body">
                <div>{items[e].name}</div>
                <table>
                  <tr>
                    <th>Store</th>
                    <th>Price</th>
                    <th>Your currency</th>
                  </tr>
                  {
                    items[e].price.map(ee => {
                      return <tr onClick={(() => window.open(`http://www.asos.com/${ee.country}/prd/${e}?browseCountry=${ee.country}&browseCurrency=${ee.currency}`, '_blank'))}><th>{ee.store}</th><th>{ee.text}</th><th>XX</th></tr>
                    })
                  }
                </table>
              </div>
            </div>
          </Col>
          ))
        }
      </Row>
    </Grid>
  </div>
  );
}

export default App;
