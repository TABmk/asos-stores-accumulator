import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';

import ProductCard from './components/ProductCard';
import { objectToArray } from './helpers';
import STORES from './stores.json';
import './App.css';

const url = 'https://www.asos.com/api/product/search/v2/categories/7368';
const LIMIT = 100;

function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const getFromStore = useCallback((i, offset = 0) => {
    return new Promise(async (res, rej) => {
      try {
        const req = await fetch(url + `?country=${STORES[i].country}&currency=${STORES[i].currency}&lang=${STORES[i].lang}&limit=${LIMIT}&offset=${offset}&store=${STORES[i].store}`);
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
      promises.push(getFromStore(i, page * LIMIT));
    }
    if (promises.length !== 0) {
      const newItems = {};
      let hasNextPage = false;
      Promise.all(promises).then((data) => {
        data.forEach((shop, i) => {
          if (page * LIMIT + shop.products.length < shop.itemCount) {
            hasNextPage = true;
          }
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

        setHasNext(hasNextPage);
        setItems([...items, ...objectToArray(newItems )]);
      });
    }
  }

  // TODO: do it better
  useEffect(getData, [getFromStore, page]);

  const onNextClick = () => {
    setPage(page + 1);
  }

  return (
  <div>
    <Grid fluid className="container">
      <Row>
        {items.map((item) => (
          <Col key={item.id} xs={12} md={6} lg={3}>
            <ProductCard item={item} />
          </Col>
        ))}
      </Row>
      {hasNext && (
        <button onClick={onNextClick}>
          Next
        </button>
      )}
    </Grid>
  </div>
  );
}

export default App;
