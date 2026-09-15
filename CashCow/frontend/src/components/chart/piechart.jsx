import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

const COLORS = ['#2e7d32', '#66bb6a', '#a5d6a7', '#c8e6c9', '#1b5e20'];

function cPieChart({ data }) {
  // expects data like: [{ name: 'Active', value: 24 }, { name: 'In Repair', value: 5 }, { name: 'Idle', value: 8 }]
  function groupByName(data) {
        const counts = data.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});

        // convert { Active: 24, Idle: 8 } → [{ name: 'Active', value: 24 }, ...]
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    const da = groupByName(data)
  return (
      <ResponsiveContainer width="40%" height={300} >
        <PieChart>
          <Pie
            data={da}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {da.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          {/* <Legend /> */}
        </PieChart>
      </ResponsiveContainer>
  );
}

export default cPieChart;