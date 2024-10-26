import React, { useEffect, useState, ChangeEvent } from "react";
import { Map, Marker, TileLayer } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";
import "./styles.css";

import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import logo from "../../assets/logo.svg";
import { api } from "../../services/api";
import { IItemDTO } from "../../dtos/IItemDTO";
import { IStatesDTO } from "../../dtos/IStatesDTO";
import { ICitiesDTO } from "../../dtos/ICitiesDTO";

export function CreatePoint() {
  const [items, setItems] = useState<IItemDTO[]>([]);
  const [ufs, setUfs] = useState<IStatesDTO[]>([]);
  const [cities, setCities] = useState<ICitiesDTO[]>([]);

  const [ufSelected, setUfSelected] = useState("0");
  const [citySelected, setCitySelected] = useState("0");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [formData, SetFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);


  useEffect(() => {
    async function fetchItems() {
      const { data } = await api.get<IItemDTO[]>("/items");

      setItems(data);
    }

    fetchItems();
  }, []);

  useEffect(() => {
    async function fetchUF() {
      const { data } = await axios.get<IStatesDTO[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados");

      setUfs(data);
    }

    fetchUF();
  }, []);

  useEffect(() => {
    async function fetchCitiesByUf() {
      const { data } = await axios.get<ICitiesDTO[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelected}/municipios`);

      setCities(data);
    }

    fetchCitiesByUf();
  }, [ufSelected]);

  // Handlers
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setUfSelected(event.target.value);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setCitySelected(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    SetFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: string) {
    // Se tiver o findIndex retorna 'true | 0' se não, retorna "false | -1"
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form>
        <h1>Cadastro do <br />Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>

            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />  

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>

              <select
                name="uf"
                id="uf"
                value={ufSelected}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {
                  ufs.map(uf => {
                    return (
                      <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                    );
                  })
                }
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>

              <select
                name="city"
                id="city"
                value={citySelected}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>

                {
                  cities.map(city => {
                    return (
                      <option key={city.id} value={city.nome}>{city.nome}</option>
                    );
                  })
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>

            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {
              items.map(item => {
                return (
                  <li 
                    key={item.id} 
                    onClick={() => handleSelectItem(item.id)}
                    className={selectedItems.includes(item.id) ? "selected" : ""}
                  >
                    <img src={item.image_url} alt={item.title} />

                    <span>{item.title}</span>
                  </li>
                )
              })
            }
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}