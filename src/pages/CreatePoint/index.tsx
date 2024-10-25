import React, { useEffect, useState, ChangeEvent } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { LatLng } from "leaflet";
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

  const [position, setPosition] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = new LatLng(latitude, longitude);

        setUserLocation(userPos);
        setPosition(userPos); // Centraliza o mapa na localização do usuário
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
      }
    );
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

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setUfSelected(event.target.value);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setCitySelected(event.target.value);
  }

  function MapClickHandler({ setPosition }: { setPosition: (pos: LatLng) => void }) {
    useMapEvents({
      click(e) {
        setPosition(e.latlng); // Atualiza a posição do marcador para a posição do clique
      }
    });

    return null;
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
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>

            <span>Selecione o endereço no mapa</span>
          </legend>

          <MapContainer center={userLocation || [-27.2092052, -49.6401092]} zoom={13}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Componente para capturar clique no mapa */}
            <MapClickHandler setPosition={setPosition} />

            {position && (
              <Marker position={position}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            )}
          </MapContainer>

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
                  <li key={item.id}>
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