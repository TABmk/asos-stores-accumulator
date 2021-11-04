import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Grid, Row, Col } from 'react-flexbox-grid';
import STORES from './stores.json'

const url = 'https://www.asos.com/api/product/search/v2/categories/7368';

function App() {
  const [items, setItems] = useState({});

  const getFromStore = useCallback((i, lim, offset = 0) => {
    return new Promise(async (res, rej) => {
      try {
        const req = await fetch(url + `?country=${STORES[i].country}&currency=${STORES[i].currency}&lang=${STORES[i].lang}&limit=${lim}&offset=${offset}&store=${STORES[i].store}`);
        await res(req.json());
      }
      catch (err) {
        console.error(err);
        rej(err)
      }
    })
  }, []);

  const getData = () => {
    const promises = [];
    for (let i = 0; i < STORES.length; i += 1) {
      promises.push(getFromStore(i, 200));
    }
    if (promises.length !== 0) {
      const newItems = {};
      Promise.all(promises).then((data) => {
        data.forEach((shop, i) => {
          shop.products.forEach((item) => {
            if (!newItems[item.id]) {
              newItems[item.id] = {
                name: item.name,
                imageUrl: item.imageUrl,
                price: [],
              }
            }

            if (item.price.current) {
              newItems[item.id].price.push({
                store: STORES[i].store,
                country: STORES[i].country,
                value: item.price.current.value,
                text: item.price.current.text,
              })
            }
          });
        })

        setItems(newItems);
      });
    }
  }

  useEffect(getData, [getFromStore]);

  return (
  <div>
    <Grid fluid className="container">
      <Row>
        {Object.keys(items).map((e) => (
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
                      return (
                        <tr key={ee.id} onClick={(() => window.open(`http://www.asos.com/${ee.country}/prd/${e}?browseCountry=${ee.country}&browseCurrency=${ee.currency}`, '_blank'))}>
                          <th>{ee.store}</th><th>{ee.text}</th><th>XX</th>
                        </tr>
                      );
                    })
                  }
                </table>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Grid>
  </div>
  );
}

export default App;
