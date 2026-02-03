import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

// Fonction pour générer des couleurs distinctes
const generateColor = (index, total) => {
  const hue = Math.round((360 / total) * index);
  return {
    background: `hsla(${hue}, 70%, 50%, 0.2)`,
    border: `hsl(${hue}, 70%, 50%)`,
    point: `hsl(${hue}, 70%, 50%)`,
  };
};

const RadarChart = ({ normalizedSections }) => {
  const labels =
    normalizedSections.length > 0
      ? Object.keys(normalizedSections[0].sections)
      : [];

  const datasets = normalizedSections.map((m, i) => {
    const color = generateColor(i, normalizedSections.length);
    return {
      label: m.nomMagazin,
      data: Object.values(m.sections),
      fill: true,
      backgroundColor: color.background,
      borderColor: color.border,
      pointBackgroundColor: color.point,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: color.point,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => value + "%",
        },
        grid: {
          color: "#ccc",
        },
        angleLines: {
          color: "#ccc",
        },
        pointLabels: {
          color: "#333",
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Radar
        data={data}
        options={options}
        width={600} // largeur fixe
        height={400} // hauteur fixe
      />
    </div>
  );
};

export default RadarChart;
