const index = document.getElementById('index');
const pastEventPage = document.getElementById('pastEvents');
const upcomingEventsPage = document.getElementById('upcomingEvents');
const detailsBox = document.getElementById('detailsBox')

const queryString = location.search;
const params = new URLSearchParams(queryString);
const id = params.get("id");

const { createApp } = Vue;


createApp({
  data() {
    return {
      eventos: [],
      fecha: '',
      categorias: [],
      inputDeTexto: '',
      eventosFiltrados: [],
      categoriasSeleccionadas: [],
      eventoId:{},
      eventoMasCapacidad:[],
      eventoMayorPorcentaje:{},
      eventoMenorPorcentaje:{},
      ganancia:[],
      porcentajeDeAsistencia:[],
      statsPorCategoriaPast: [],
      statsPorCategoriaUp: [],

    };

  },
  created() {
    fetch("http://amazing-events.herokuapp.com/api/events")
      .then((respuesta) => respuesta.json())
      .then((json) => {
        this.eventos = json.events;
        this.fecha = json.currentDate

        this.creacionDeCheckboxes();
        this.conseguirMayorCapacidad()
        this.conseguirAsistensias(this.eventos.filter(evento => evento.date < this.fecha))
        this.tablasPorCategorias(this.eventos.filter(evento => evento.date < this.fecha), this.statsPorCategoriaPast)
        this.tablasPorCategorias(this.eventos.filter(evento => evento.date > this.fecha), this.statsPorCategoriaUp)
        console.log(this.statsPorCategoria)


        if(detailsBox){
            this.eventoId = this.eventos.find(eventos => eventos._id == id)
        }
        if(pastEventPage){
            this.eventos= this.eventos.filter(evento => evento.date < this.fecha)
        }
        if(upcomingEventsPage){
            this.eventos= this.eventos.filter(evento => evento.date > this.fecha)
        }
        


      });
  },

  mounted() {},

  methods: {
    creacionDeCheckboxes() {
      this.eventos.forEach((evento) => {
        if (!this.categorias.includes(evento.category)) {
          this.categorias.push(evento.category);
        }
      });
    },

    filtroInputDeTexto(arrayDeEventos){
        this.eventosFiltrados = arrayDeEventos.filter(evento => evento.description.toLowerCase().includes(this.inputDeTexto.toLowerCase()) || evento.name.toLowerCase().includes(this.inputDeTexto.toLowerCase()))
    },

    conseguirMayorCapacidad(){
        let capacidades = this.eventos.map(event => event.capacity)
        this.eventoMasCapacidad = this.eventos.find(event => event.capacity == Math.max(...capacidades))
    },

    conseguirAsistensias(eventosPasados){
        let asistencias = eventosPasados.map(event => event.assistance / event.capacity)
        this.eventoMayorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.max(...asistencias))
        this.eventoMenorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.min(...asistencias))
    },

    tablasPorCategorias(eventosPorFecha, arrayDeGuardado){
        let categoriasAuxiliares= []
        eventosPorFecha.forEach(evento => {
            if (!categoriasAuxiliares.includes(evento.category)){
                categoriasAuxiliares.push(evento.category)
            }
        })

        categoriasAuxiliares.forEach(categoria =>{
            let estimados = []
            let capacidad = []
            let arrayDeGanancias = []

            eventosPorFecha.forEach(evento =>{
                if(evento.category == categoria){
                    estimados.push(evento.estimate??evento.assistance)
                    capacidad.push(evento.capacity)
                    arrayDeGanancias.push(evento.price*Number(evento.estimate??evento.assistance))
                }
            })
            this.ganancia.push(arrayDeGanancias.reduce((a,b) => a+b))
            this.porcentajeDeAsistencia.push(Math.round((estimados.map(i=>Number(i)).reduce((a, b) => a + b))*100/(capacidad.map(i=>Number(i)).reduce((a, b) => a + b))))

            arrayDeGuardado.push([categoria, (arrayDeGanancias.reduce((a,b) => a+b)), (Math.round((estimados.map(i=>Number(i)).reduce((a, b) => a + b))*100/(capacidad.map(i=>Number(i)).reduce((a, b) => a + b))))])
        })
    }

  },
  computed: {
    filtrosJuntos(){
        if(this.categoriasSeleccionadas.length != 0){
            this.eventosFiltrados = this.eventos.filter(evento =>{
                return this.categoriasSeleccionadas.includes(evento.category)
            })
        } else {
            this.eventosFiltrados = this.eventos
        }
        if (this.inputDeTexto != ''){
            this.filtroInputDeTexto(this.eventosFiltrados)
        }
    }
  },

}).mount("#app");



 