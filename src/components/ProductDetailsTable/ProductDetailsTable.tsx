import type { ProductDetails } from "../../types";
import Styles from "./ProductDetailsTable.module.scss";

const ProductDetailsTable = ({ product }: { product: ProductDetails }) => {
  const {
    brand,
    model,
    cpu,
    ram,
    os,
    displayResolution,
    battery,
    primaryCamera,
    secondaryCmera,
    dimentions,
    weight,
  } = product;

  return (
    <table className={Styles.ProductDetailsTable}>
      <thead>
        <tr>
          <th>
            <h2>Description</h2>{" "}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope='row'>Brand</th>
          <td>{brand}</td>
        </tr>
        <tr>
          <th scope='row'>Model</th>
          <td>{model}</td>
        </tr>
        <tr>
          <th scope='row'>CPU</th>
          <td>{cpu}</td>
        </tr>
        <tr>
          <th scope='row'>RAM</th>
          <td>{ram}</td>
        </tr>
        <tr>
          <th scope='row'>OS</th>
          <td>{os}</td>
        </tr>
        <tr>
          <th scope='row'>Resolution</th>
          <td>{displayResolution}</td>
        </tr>
        <tr>
          <th scope='row'>Battery</th>
          <td>{battery}</td>
        </tr>
        <tr>
          <th scope='row'>Primary Camera</th>
          <td>{primaryCamera}</td>
        </tr>
        <tr>
          <th scope='row'>Selfie Camera</th>
          <td>{secondaryCmera}</td>
        </tr>
        <tr>
          <th scope='row'>Dimensions</th>
          <td>{dimentions}</td>
        </tr>

        <tr>
          <th scope='row'>Weight</th>
          <td>{weight}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ProductDetailsTable;
