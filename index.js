const express = require("express");

const server = express();

// DESAFIO NODEJS 01 - GOSTACK
/*
	- Criar um projeto que irá fazer um crud de projetos e um crud de tarefas
*/

// DATABASE
const projects = [];
let reqs = 0;

// MIDDLEWARES
server.use(express.json());
/* 
	- LOCAL
		- Valida se o título do projeto está disponível
		- Valida se o título do projeto está preenchido
		- Validar se o título da task está preenchido
	- GLOBAL
		- Dar um console.log em sempre que o usuário fizer uma requisição informando-o quantas requisições ele já fez
*/

	server.use((req, res, next) => {
		reqs++;
		console.log(`req number ${reqs}`);
		return next();
	});

	function projectIsAvailable(req, res, next) {
		const index = projects.map(p => p.title).indexOf(req.body.title);
		if(index !== -1) {
			return res.status(401).json({ message: "Title is not available", reason: 'available' });
		}
		return next();
	}

	function titleIsOk(req, res, next) {
		const { title } = req.body;
		if(!title) {
			return res.status(401).json({ message: "Title is required", reason: 'required' })
		}
		return next();
	}

	function taskIsAvailable(req, res, next) {
		let index = projects.map(p => p.id).indexOf(req.params.id);
		if(index !== -1) {
			req.project_index = index;
			index = projects[index].tasks.map(t => t).indexOf(req.body.title);
			if(index !== -1) {
				return res.status(401).json({ message: "Title is not available", reason: 'available' });
			}
			return next();
		}
	}

// ROUTES
	/* projects index */
	server.get('/projects', (req, res) => res.json(projects));

	/* projects store */
	server.post('/projects', titleIsOk, projectIsAvailable, (req, res) => {
		projects.push({
			id: `__${Math.random().toString(36).substring(7)}`,
			title: req.body.title,
			tasks: []
		});
		res.json(projects);
	});

	/* projects show */
	server.get('/projects/:id', (req, res) => {
		const index = projects.map(p => p.id).indexOf(req.params.id);
		if(index === -1) {
			return res.status(404).json({ message: "Project is not found" })
		}
		return res.json(projects[index]);
	});

	/* projects update */
	server.put('/projects/:id', titleIsOk, (req, res) => {
		const index = projects.map(p => p.id).indexOf(req.params.id);
		if(index === -1) {
			return res.status(404).json({ message: "Project is not found" })
		}
		projects[index].title = req.body.title;
		return res.json(projects);
	});

	/* projects delete */
	server.delete('/projects/:id', (req, res) => {
		const index = projects.map(p => p.id).indexOf(req.params.id);
		if(index === -1) {
			return res.status(404).json({ message: "Project is not found" })
		}
		projects.splice(projects[index], 1);
		return res.send();
	});

	/* task index */
	server.get('/projects/:id/tasks', (req, res) => {
		const index = projects.findIndex(p => p.id == req.params.id);
		res.json(projects[index].tasks)
	});

	/* task store */
	server.post('/projects/:id/tasks', titleIsOk, taskIsAvailable, (req, res) => {
		projects[req.project_index].tasks.push(req.body.title);
		return res.json(projects);
	});

	/* task show */
	server.get('/projects/:id/tasks/:index', (req, res) => {
		const index = projects.findIndex(p => p.id == req.params.id);
		const task = projects[index].tasks[req.params.index];
		if(!task) {
			return res.status(404).json({ message: "Task is not found" });
		}
		return res.json(task);
	});

	/* task update */
	server.put('/projects/:id/tasks/:index', titleIsOk, (req, res) => {
		const index = projects.findIndex(p => p.id == req.params.id);
		const task = projects[index].tasks[req.params.index] = req.body.title;
		return res.json(task)
	});


	/* task delete */	
	server.delete('/projects/:id/tasks/:index', (req, res) => {
		const index = projects.findIndex(p => p.id == req.params.id);
		projects[index].tasks.splice(req.params.index, 1);
		return res.send('');
	})

const PORT = 3000;
server.listen(PORT || 3000);