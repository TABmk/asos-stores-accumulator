import { useState } from 'react';

const ProductCard = ({item, rates, myCurr, promocode}) => {
  const [hidePrice, setHidePrice] = useState(true);

  return (
  <div className="prd">
    <img alt="" className="prd_img" src={'https://' + item.imageUrl} />
    <div className="prd_body">
      <div>{item.name}</div>
      <div className={hidePrice ? "tableContainer" : ''}>
        <table>
          <tbody>
            <tr>
              <th>🏠</th>
              <th>💲</th>
              <th>{myCurr}</th>
              <th>🏷️</th>
            </tr>
            {
              item.price
              ?.map(e => {
                const myCurrPrice = Math.floor(e.value * rates[`${e.currency}${myCurr}`]);
                return {
                  ...e,
                  myCurrPrice,
                  promoPrice: myCurrPrice * (1 - promocode/100),
                }
              })
              ?.sort((a, b) => a.myCurrPrice - b.myCurrPrice)
              ?.map(price => (
                <tr key={item.id + price.store} onClick={(() => window.open(`http://www.asos.com/${price.country}/prd/${item.id}?browseCountry=${price.country}&browseCurrency=${price.currency}`, '_blank'))}>
                  <th>{price.store}</th><th>{price.text}</th><th>{price.myCurrPrice}</th><th>{Math.floor(price.promoPrice)}</th>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
    {
      item.price.length > 3
       ? <div onClick={() => setHidePrice(!hidePrice)} className="priceSpoiler">{hidePrice ? '🔽🔽🔽' : '🔼🔼🔼'}</div>
       : null
    }
  </div>
)};

export default ProductCard;
