const ProductCard = ({item}) => {
  return (
  <div className="prd">
    <img alt="" className="prd_img" src={'https://' + item.imageUrl} />
    <div className="prd_body">
      <div>{item.name}</div>
      <table>
        <tbody>
          <tr>
            <th>Store</th>
            <th>Price</th>
            <th>Your currency</th>
          </tr>
          {item.price?.map(price => (
            <tr key={item.id + price.store} onClick={(() => window.open(`http://www.asos.com/${price.country}/prd/${item.id}?browseCountry=${price.country}&browseCurrency=${price.currency}`, '_blank'))}>
              <th>{price.store}</th><th>{price.text}</th><th>XX</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)};

export default ProductCard;
