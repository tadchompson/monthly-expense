import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ExpenseService } from '../../services/expense.service';
import { DashboardData } from '../../models/expense.model';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CurrencyPipe, DatePipe, NgxEchartsDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  data = signal<DashboardData | null>(null);
  selectedYear = signal(new Date().getFullYear());
  selectedMonth = signal<number | null>(null);
  availableYears = signal<number[]>([]);
  loading = signal(false);

  selectedMonthName = computed(() => {
    const m = this.selectedMonth();
    return m ? MONTH_FULL_NAMES[m - 1] : null;
  });

  trendChartOption = computed<EChartsOption>(() => {
    const d = this.data();
    if (!d) return {};

    const months = Array.from({ length: 12 }, (_, i) => MONTH_NAMES[i]);
    const expenseValues = new Array(12).fill(0);
    const incomeValues = new Array(12).fill(0);

    d.monthlyTrend.forEach((m) => {
      expenseValues[m.month - 1] = m.total;
    });
    d.monthlyIncome.forEach((m) => {
      incomeValues[m.month - 1] = m.total;
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          let html = `${items[0].name}<br/>`;
          items.forEach((p: any) => {
            html += `${p.marker} ${p.seriesName}: $${p.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>`;
          });
          return html;
        },
      },
      legend: { data: ['Expenses', 'Income'], bottom: 0 },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value', axisLabel: { formatter: '${value}' } },
      series: [
        {
          name: 'Expenses',
          type: 'bar',
          data: expenseValues,
          itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: '#2563eb' } },
        },
        {
          name: 'Income',
          type: 'bar',
          data: incomeValues,
          itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: '#16a34a' } },
        },
      ],
      grid: { left: 60, right: 20, top: 20, bottom: 50 },
    };
  });

  categoryChartOption = computed<EChartsOption>(() => {
    const d = this.data();
    if (!d || d.categoryBreakdown.length === 0) return {};

    return {
      tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontWeight: 'bold' } },
        data: d.categoryBreakdown.map((c) => ({
          name: c.category,
          value: c.total,
        })),
      }],
    };
  });

  ngOnInit() {
    this.expenseService.getYears().subscribe((years) => {
      this.availableYears.set(years.length ? years : [new Date().getFullYear()]);
      if (years.length && !years.includes(this.selectedYear())) {
        this.selectedYear.set(years[0]);
      }
      this.loadDashboard();
    });
  }

  loadDashboard() {
    this.loading.set(true);
    this.expenseService.getDashboard(this.selectedYear(), this.selectedMonth()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onYearChange() {
    this.selectedMonth.set(null);
    this.loadDashboard();
  }

  onChartClick(params: any) {
    if (params.componentType === 'series' && params.dataIndex != null) {
      const monthIndex = params.dataIndex + 1; // 1-based month
      // Toggle off if clicking the same month
      if (this.selectedMonth() === monthIndex) {
        this.selectedMonth.set(null);
      } else {
        this.selectedMonth.set(monthIndex);
      }
      this.loadDashboard();
    }
  }

  clearMonthFilter() {
    this.selectedMonth.set(null);
    this.loadDashboard();
  }
}
