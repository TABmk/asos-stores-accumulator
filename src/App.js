import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';

import ProductCard from './components/ProductCard';
import { objectToArray } from './helpers';
import STORES from './stores.json';
import './App.css';

const urlTemplate = 'https://www.asos.com/api/product/search/v2/categories/';
const LIMIT = 200;

let _items = [];

function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  // const [hasNext, setHasNext] = useState(false);
  const [rates, setRates] = useState({});
  const [myCurr] = useState('RUB');
  const [promocode, handlePromocode] = useState(0);
  const [storeItems, setStoreItems] = useState(STORES.map(e => ({...e, count: 0, loaded: 0})));

  const params = new URLSearchParams(window.location.search);
  const URL = params.get('cat');

  const handleCategory = (e) => {
    const { value } = e.target;

    const cat = value.match(/cid=(\d+)/);

    if (cat) {
      window.location = '?cat=' + cat[1];
    }
  }

  const sortItems = (sort) => {
    let olditems = [...items];
    
    olditems = olditems.map(e => ({
      ...e,
      price: e.price.map(ee => {
        const myCurrPrice = Math.floor(ee.value * rates[`${ee.currency}${myCurr}`]);
        return {
          ...ee,
          myCurrPrice,
          promoPrice: myCurrPrice * (1 - promocode/100),
        }
      }).sort((a, b) => a.myCurrPrice - b.myCurrPrice)
    }));

    if (sort === 'pricel') {
      olditems = olditems.sort((a, b) => a.price[0].myCurrPrice - b.price[0].myCurrPrice)
    }
    if (sort === 'priceu') {
      olditems = olditems.sort((a, b) => b.price[0].myCurrPrice - a.price[0].myCurrPrice)
    }

    setItems(olditems);
  }

  const getFromStore = useCallback(async (i, offset = 0) => {
      try {
        const req = await fetch(urlTemplate + URL + `?country=${STORES[i].country}&currency=${STORES[i].currency}&lang=${STORES[i].lang}&limit=${LIMIT}&offset=${offset}&store=${STORES[i].store}`);
        return await req.json();
      }
      catch (err) {
        console.error(err);
        throw new Error(err);
      }
  }, []);


  const getData = () => {
    if (!URL) {
      return;
    }
    fetch('http://getrates.su/')
      .then(($) => $.json())
      .then(setRates)

    const promises = [];
    for (let i = 0; i < STORES.length; i += 1) {
      promises.push(getFromStore(i, page * LIMIT));
    }
    if (promises.length !== 0) {
      const newItems = {};
      // let hasNextPage = false;
      Promise.all(promises).then((data) => {
        data.forEach((shop, i) => {
          if (!shop.products) {
            return
          }
          const _storeItems = [ ...storeItems ];
          _storeItems[i].count = shop.itemCount;
          _storeItems[i].loaded += shop.products.length;

          setStoreItems(_storeItems);
          if (page * LIMIT + shop.products.length < shop.itemCount) {
            setPage(page + 1);
            // hasNextPage = true;
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
                currency: STORES[i].currency,
              })
            }
          });
        })

        // console.log(_items);

        // setHasNext(hasNextPage);
        setItems([..._items, ...objectToArray(newItems )]);
        _items = [...items, ...objectToArray(newItems )];
      });
    }
  }

  // TODO: do it better
  useEffect(getData, [getFromStore, URL, page]);

  // const onNextClick = () => {
  //   setPage(page + 1);
  // }

  return (
  <div>
    {
      storeItems.map(e => (
        <div key={e.store}>{e.store}: {e.count} items ({e.loaded} loaded)</div>
      ))
    }
    Promocode % <input type="number" onChange={(e) => handlePromocode(e.target.value)} /> <br />
    Category <input type="text" onChange={handleCategory} /><br />
    Price: <button onClick={() => sortItems('pricel')}>🔼</button> <button onClick={() => sortItems('priceu')}>🔽</button>
    {URL ? <Grid fluid className="container">
      <Row>
        {items.map((item) => (
          <Col key={item.id + Math.random()} xs={6} md={3} lg={2.5}>
            <ProductCard
              promocode={promocode}
              rates={rates}
              item={item}
              myCurr={myCurr}
            />
          </Col>
        ))}
      </Row>
      {/* {hasNext && (
        <button onClick={onNextClick}>
          Next
        </button>
      )} */}
    </Grid> : null }
  </div>
  );
}

export default App;
