// Copyright (c) nico
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import '@pixano/graphics-2d';
//@ts-ignore
//import { commonJson, colorToRGBA } from '@pixano/core/lib/utils';

import  './attribute-picker.js';
  import  {commonJson,colorToRGBA} from './utils.js'

import { MODULE_NAME, MODULE_VERSION } from './version';
 
// Import the CSS
import '../css/widget.css';

//@ts-ignore
import {createPencil,zoomIn,polyline,zoomOut,pointer,demoStyles,brush,union,subtract,magicSelect,increase,decrease} from './style';

//@ts-ignore
import {html,LitElement,customElement} from 'lit-element';
import '@material/mwc-icon-button';

const EditionMode = {
  ADD_TO_INSTANCE: 'add_to_instance',
  REMOVE_FROM_INSTANCE: 'remove_from_instance',
  NEW_INSTANCE: 'new_instance'
};
//@ts-ignore
const cat_colors:{ [name: string]: string } ={
  'dog':'blue',
  'toto':'red',
  'titi':'blue'
} 





//@ts-ignore
 const label_schema_defaut={
      category: [
        { name: 'class1', color: "blue", properties: [] },
        { name: 'class2', color: "#eca0a0", properties: [] },
        {
          name: 'class3', color: "green", properties: [
            { name: 'checkbox example', type: 'checkbox', default: false },
            { name: 'dropdown example', type: 'dropdown', enum: ['something', 'something else', 'anything else'], default: 'something' },
            { name: 'textfield example', type: 'textfield', default: 'some text' }
          ]
        },
        { name: 'class4', color: "red", properties: [] },
      ],
      default: 'class1'
    };

//@customElement('my-element' as any)
class pixanoRightPanel extends LitElement {
   static get styles() {
    return demoStyles;
  } 

  //public click_func:any;
  public pxnElement:any;
  public pixano_element_type:any;
  public last_mode:string;

  constructor() {
    super();
    this.pxnElement =null;
    this.pixano_element_type='';
    this.last_mode="";
  }
  render() {
    return html`
    <main>
      <div class="right-panel">
        
        <div class="icons"> 
          <p  class="icon" title="Add polygon"  @click=${() => this.pencil_func() } >${createPencil}</p>
          <p  class="icon" title="Edit"         @click=${() => this.pointer_func() } >${pointer}</p>
          ${this.pixano_element_type==='pxn-segmentation' || this.pixano_element_type==='pxn-smart-segmentation'
            ? html`
              <p class="icon" title="Brush"                @click=${() => this.brush_func() } >${brush}</p>
                ${this.pixano_element_type==='pxn-smart-segmentation'
                  ? html`<p class="icon" title="Smart Segmentation"     @click=${() => this.smart_rect_func() } >${magicSelect}</p>`
                  : ''
                } 
              <p class="icon" title="Remove from instance" @click=${() => this.sub_func() } >${subtract}</p>
              <p class="icon" title="Add to instance"      @click=${() => this.add_func() } >${union}</p>
              `
            : ''
          } 
          
         ${this.pixano_element_type==='pxn-smart-rectangle'
             ? html`
             <p class="icon" title="Smart Rectangle"     @click=${() => this.smart_rect_func() } >${magicSelect}</p>
             <p class="icon" title="ROI increase (+)" @click=${() => this.pxnElement.roiUp()}>${increase}</p>
             <p class="icon" title="ROI decrease (-)" @click=${() => this.pxnElement.roiDown()}>${decrease}</p>
             `
             : ''
           } 

        </div>
      </div>
      </main>
    `;
  }
 
pencil_func(){
  if (this.pxnElement!==null) {this.pxnElement.mode = 'create'
    this.last_mode="create"
    this.pxnElement.editionMode="new_instance"
    console.log('this.pxnElement.mode',this.pxnElement.mode);
    console.log('this.pxnElement.editionMode',this.pxnElement.editionMode);
   }
}
pointer_func(){
  if (this.pxnElement!==null) {this.pxnElement.mode = 'edit' }
}
brush_func(){
  if (this.pxnElement!==null) {this.pxnElement.mode = 'create-brush' 
  this.last_mode="create-brush"
  }
}
sub_func(){
  if (this.pxnElement!==null) {
    this.pxnElement.editionMode=EditionMode.REMOVE_FROM_INSTANCE 
    if (this.last_mode!=="") this.pxnElement.mode=this.last_mode

     console.log('this.pxnElement.mode',this.pxnElement.mode);
     console.log('this.pxnElement.editionMode',this.pxnElement.editionMode);}
}
add_func(){
  if (this.pxnElement!==null) {
    this.pxnElement.editionMode=EditionMode.ADD_TO_INSTANCE
    if (this.last_mode!=="") this.pxnElement.mode=this.last_mode;
    console.log('this.pxnElement.mode',this.pxnElement.mode);
    console.log('this.pxnElement.editionMode',this.pxnElement.editionMode);
  }
}  
smart_rect_func(){
  if (this.pxnElement!==null) {this.pxnElement.mode='smart-create' }
}   
}
customElements.define('pixano-right-panel', pixanoRightPanel);




export class PixanoModel extends DOMWidgetModel {
	defaults() {
		return {...super.defaults(),
			_model_name: PixanoModel.model_name,
			_model_module: PixanoModel.model_module,
			_model_module_version: PixanoModel.model_module_version,
			_view_name: PixanoModel.view_name,
			_view_module: PixanoModel.view_module,
			_view_module_version: PixanoModel.view_module_version,

			element:'pxn-rectangle',

			image_path :'',
			image_data:'',
			mode:'none',
			counter:0,
			// shapes:[],
			// selectedShapeIds:[],
			// shapes_in:[],
			// mask:'',
			// current_category:'',
			// categories_colors:{},


			annotations:{},
			annotations_input:{},
			selectedIds:{},

			//targetClass:1,
			//clsMap:{},
			maskVisuMode:'INSTANCE',

			label_schema:{},
			image_src:''

		};
  	}


	static serializers: ISerializers = {
		...DOMWidgetModel.serializers,
		// Add any extra serializers here
	};

	static model_name = 'PixanoModel';
	static model_module = MODULE_NAME;
	static model_module_version = MODULE_VERSION;
	static view_name = 'PixanoView';
	static view_module = MODULE_NAME;
	static view_module_version = MODULE_VERSION;
}





export class PixanoView extends DOMWidgetView {
	private pxnElement:any;
	private right_panel:any;
	private attributePicker:any;
	private selectedIds:[];
	private annotations:[];
	private schema:any; 

  	render() {
	    console.log("pixanoooooo 1.5");
	    this.selectedIds = [];
	    const pxn_element_type= this.model.get('element');
	    console.log("create "+pxn_element_type);
	  	this.annotations=[];

	    const link_for_material=document.createElement('h5')
	    link_for_material.innerHTML='<link      href="https://fonts.googleapis.com/css?family=Material+Icons&display=block"      rel="stylesheet"/>'
	    this.el.appendChild(link_for_material);

	    const main = document.createElement('div');
	    main.classList.add("main-div")

	    const pix_container=document.createElement('div');
	    pix_container.classList.add("my-container")


	    this.pxnElement = document.createElement(pxn_element_type);
	    
	    if (this.model.get('image')!== null){
	      this.pxnElement.input="data:image/png;base64,"+this.model.get('image');
	    }

		this.pxnElement.tabIndex=1
	    this.pxnElement.mode='edit';
	    this.pxnElement.addEventListener('create',    (e:any) => { this.callback_create(e) })
	    this.pxnElement.addEventListener('update',    (e:any) => { this.callback_update(e) })
	    this.pxnElement.addEventListener('delete',    (e:any) => { this.callback_delete(e) })
	    this.pxnElement.addEventListener('selection', (e:any) => { this.callback_select(e) })

	    main.appendChild(this.pxnElement);



	    this.right_panel=document.createElement('pixano-right-panel');
	    this.right_panel.pxnElement=this.pxnElement;
	    this.right_panel.pixano_element_type=pxn_element_type;
	    main.appendChild(this.right_panel);



	    const properties_panel:any=document.createElement("div")
	    properties_panel.classList.add('properties-panel')

	    const label_schema_python=this.model.get('label_schema')

	    //console.log("length",label_schema_python.category)
	    if (label_schema_python.category && label_schema_python.category.length>0){
	    	console.log("with schema")
	    	//console.log("label_schema_python",label_schema_python)
	    	this.attributePicker=document.createElement('attribute-picker');
	        this.attributePicker.reloadSchema(label_schema_python)
	        this.attributePicker.addEventListener('update',()=>{this.onAttributeChanged()});
	        this.attributePicker.showDetail=false
	        //console.log(this.attributePicker._getList()[0])
			this.attributePicker.setCategory(this.attributePicker._getList()[0])
	   		//console.log(this.attributePicker.defaultValue)

	   		properties_panel.appendChild(this.attributePicker);


	   		if (pxn_element_type.search("segmentation")!==-1) {
	   			//console.log("with segmentation")
				//const schema =label_schema_python
				this.pxnElement.clsMap = new Map(
				label_schema_python.category.map((c:any) => {
					const color = colorToRGBA(c.color);
					return [c.idx, [color[0], color[1], color[2], c.instance ? 1 : 0]]
				})
				);
				//console.log("!!!!",this.pxnElement.clsMap)
				if (!label_schema_python.default) label_schema_python.default = label_schema_python.category[0].name;
				this.schema=label_schema_python

				this.pxnElement.targetClass = label_schema_python.category.find((c:any) => c.name === label_schema_python.default).idx;
			}
	    }
	    else{
	        this.attributePicker=null//.reloadSchema(label_schema_defaut)
	    }
	   
	   	main.appendChild(properties_panel);



	    this.el.appendChild(main);
	    
	    
	   
	    //this.pxnElement.addEventListener('keydown', (event:any) => {
		//	console.log('keydown el');
		//	console.log('this.pxnElement.mode',this.pxnElement.mode);
		//	console.log('this.pxnElement.editionMode',this.pxnElement.editionMode);
		//	console.log('this.pxnElement.modes',this.pxnElement.modes[this.pxnElement.mode])
	    //});
	    
	    this.pxnElement.maskVisuMode='SEMANTIC';



	    this.model.on('change:image', this._onImagedataChanged, this);
	    this.model.on('change:mode', this._onModeChanged, this);
	    
	   // this.model.on('change:shapes_in', this._onShapesInChanged, this);
	    this.model.on('change:annotations_input', this._onAnnotationsInChanged, this);

	    //this.model.on('change:shapes', this._onShapesChanged, this);
	    //this.model.on('change:selectedShapeIds', this._onSelectedShapeIdsChanged, this);
	    this.model.on('change:label_schema', () => {console.log("change schema",this.model.get("label_schema"))}, this);


	    if (pxn_element_type.search("segmentation")!==-1) {
			// this.pxnElement.targetClass=this.model.get("targetClass"); 
			this.pxnElement.maskVisuMode=this.model.get("maskVisuMode");
			this.model.on('change:targetClass', () => {this.pxnElement.targetClass=this.model.get("targetClass")}, this);
			this.model.on('change:clsMap', () => {this.pxnElement.clsMap=this.model.get("clsMap")}, this);
			this.model.on('change:maskVisuMode', () => {this.pxnElement.maskVisuMode=this.model.get("maskVisuMode")}, this);
	   	}
  
	}
	initAnnotations() {
		this.setAnnotations([]);
		this.setSelectedIds([]);
	}
	
	setAnnotations(newAnnotations:any) {
		// console.log("prev nnotation=",this.annotations);
		// console.log("newAnnotation=",newAnnotations);
		this.annotations = newAnnotations;
	}

	setSelectedIds(newIds:any) {
		// console.log("setSelectedIds")

		if (!newIds) newIds=[];
		this.selectedIds = newIds;
		if (this.attributePicker) this.attributePicker.showDetail = this.selectedIds.length>0;
	}

	updateModelAnnotations(){
		console.log("updateModelAnnotations");//,this.annotations)

		this.model.set("annotations",JSON.parse(JSON.stringify([...this.annotations]))); 
		this.model.set("annotations_input",JSON.parse(JSON.stringify(['-']))); 

		this.touch();

	}
	updateModelSelectedIds(){
		console.log("updateModelSelectedIds",this.selectedIds)
		
		this.model.set("selectedIds",JSON.parse(JSON.stringify([...this.selectedIds]))); 
		this.touch();

	}

  	private onAttributeChanged() {
		console.log("onAttributeChanged")
		// const value =  this.attributePicker.value;
		// //console.log("value = ",value)

		// this.selectedIds.forEach((id:any) => {
		// 	const shape = [...this.pxnElement.shapes].find((s) => s.id === id);
		// 	//console.log("match shape",shape)
		// 	shape.options = shape.options || {};
		// 	Object.keys(value).forEach((key) => {
		// 		shape[key] = JSON.parse(JSON.stringify(value[key]));
		// 	});
		// 	shape.color = this.attributePicker._colorFor(shape.category);
		// });

		// //console.log("shape after",JSON.parse(JSON.stringify([...this.pxnElement.shapes])))
		// this.model.set("shapes",JSON.parse(JSON.stringify([...this.pxnElement.shapes]))); 
		// this.touch();
		let shapes;
		const value =  this.attributePicker.value;
		//console.log("value = ",value)
		const pxn_element_type= this.model.get('element');
		switch (pxn_element_type) {
			case 'pxn-classification':
				console.log("clasif setannot attchange");
				this.setAnnotations([value]);
				this.updateModelAnnotations();
				this.updateModelSelectedIds();
				break;
			case 'pxn-keypoints':
			case 'pxn-rectangle':
			case 'pxn-smart-rectangle':
			case 'pxn-polygon':
				this.selectedIds.forEach((id) => {
					// get selected shape
					const shape = [...this.pxnElement.shapes].find((s:any) => s.id === id);
					// apply new properties
					shape.options = shape.options || {};
					Object.keys(value).forEach((key) => {
						shape[key] = JSON.parse(JSON.stringify(value[key]));
					});
					shape.color = this.attributePicker._colorFor(shape.category);
					// concatenate and set
					if (pxn_element_type==='cuboid-editor') shapes = [...this.pxnElement.editableCuboids].map(({color, ...s}) => s);
					else shapes = [...this.pxnElement.shapes].map(({color, ...s}) => s);
				//	else shapes = [...this.pxnElement.shapes]
					this.setAnnotations(shapes);
					//console.log(shapes)
					this.updateModelAnnotations();
					this.updateModelSelectedIds();
				});
				break;
			case 'pxn-segmentation':
			case 'pxn-smart-segmentation':
				if (!this.selectedIds.length) {//nothing is selected
					// only set the category acordingly to the selected attribute
					const category =  this.attributePicker.selectedCategory;
					this.pxnElement.targetClass = category.idx;
					break;
				}
				let frame = this.annotations;
				// 1) update the mask (always id 0)
				// change category in pxnElement
				const category =  this.attributePicker.selectedCategory;
				this.pxnElement.targetClass = category.idx;
				// console.log("ids",this.pxnElement.selectedId)
				// console.log(this.pxnElement.clsMap)
				this.pxnElement.fillSelectionWithClass(category.idx);
				// get the new mask and store it
				let mask:any = frame.find((l:any) => l.id === 0);
				mask.mask = this.pxnElement.getMask();//just overwrite the previous mask
				// 2) update annotation info from attributes
				let label:any = frame.find((l:any) => l.id === JSON.stringify(this.selectedIds));// search the corresponding id
				if (label){
					Object.keys(value).forEach((key) => {
						label[key] = JSON.parse(JSON.stringify(value[key]));
					});
				}
				// category has changed => selectedId has also changed, update it
				const updatedIds = this.pxnElement.selectedId;
				label.id = JSON.stringify(updatedIds);
				this.setSelectedIds(updatedIds);
				// 3) store the new annotation structure
				this.setAnnotations(frame);
				this.updateModelAnnotations();
				this.updateModelSelectedIds();
				break;
			case 'pxn-cuboid-editor':
				this.selectedIds.forEach((id) => {
					const shape = [...this.pxnElement.editableCuboids].find((s) => s.id === id);
					shape.options = shape.options || {};
					Object.keys(value).forEach((key) => {
						shape[key] = JSON.parse(JSON.stringify(value[key]));
					});
					shape.color = this.attributePicker._colorFor(shape.category);
					const shapes = [...this.pxnElement.editableCuboids].map(({color, ...s}) => s);
					this.setAnnotations(shapes);
					this.updateModelAnnotations();
					this.updateModelSelectedIds();
				});
				break;
			case 'pxn-tracking':
			case 'pxn-tracking-graph':
			case 'pxn-smart-tracking':
				//this.setAnnotations(this.tracks)
				break;
			default:
				console.error("onAttributeChanged: plugin ${pxnElement} unknown");
		}



		
  	}

  
  	private _onImagedataChanged() {
	    //console.log("_onImageDataChanged with new image data");

	    this.pxnElement.input="data:image/png;base64,"+this.model.get('image');
	    const pxn_element_type= this.model.get('element');
	    this.initAnnotations()

	 //    this.pxnElement.shapes=[];
	    
		// this.model.set("shapes",JSON.parse(JSON.stringify([...this.pxnElement.shapes]))); 
	 //    this.model.set("shapes_in",JSON.parse(JSON.stringify(['-']))); 
	 //    this.touch();	   

		if (pxn_element_type==='pxn-segmentation' || pxn_element_type==='pxn-smart-segmentation') {
			this.pxnElement.clsMap = new Map(
				this.schema.category.map((c:any) => {
					const color = colorToRGBA(c.color);
					return [c.idx, [color[0], color[1], color[2], c.instance ? 1 : 0]]
				})
			);
			if (!this.schema.default) this.schema.default = this.schema.category[0].name;
			this.pxnElement.targetClass = this.schema.category.find((c:any) => c.name === this.schema.default).idx;
		}

	    this.updateModelAnnotations();
	   

  	}
  	private _onModeChanged() {
	    //console.log("_onModeChanged");
	    this.pxnElement.mode=this.model.get('mode');
  	}
  
  	// private _onShapesInChanged() {
	  //   //console.log("_shapes_in_changed");
	  //   const shapes_in=this.model.get('shapes_in');
	  //   //console.log("shapes_in",shapes_in);

	  //   if (shapes_in[0]!=='-') {
			// this.pxnElement.shapes=shapes_in;
			// // copy shapes_in (from python) to shapes and trigger change on shapes
			// this.model.set("shapes",JSON.parse(JSON.stringify([...this.pxnElement.shapes]))); 
			// this.touch();
	  //   }
	  //   else{ 
	  //   //  	console.log("vide");
	  //  }
  	// }
	private _onAnnotationsInChanged() {
	    console.log("_onAnnotations Input ");
	    const annotations_input=this.model.get('annotations_input');
	    //console.log("shapes_in",shapes_in);
		const pxn_element_type= this.model.get('element');
	    if (annotations_input[0]!=='-') {
			switch (pxn_element_type) {
				case 'pxn-classification':
					/* nothing to do */
					break;
				case 'pxn-keypoints':
				case 'pxn-rectangle':
				case 'pxn-polygon':
				case 'pxn-cuboid-editor':
				case 'pxn-smart-rectangle':
					const shapes = [...annotations_input].map(shape => {
										var newShape=shape;
										newShape.color=this.attributePicker._colorFor(newShape.category);
										return newShape}

					)
					this.pxnElement.shapes=shapes;
					this.setAnnotations(annotations_input);

					this.updateModelAnnotations()
					break;
				case 'pxn-segmentation':
				case 'pxn-smart-segmentation':
					//console.log("annotations_input",annotations_input)

					let mask:any = annotations_input.find((l:any) => l.id === 0);
					//console.log(mask)
					//console.log(typeof mask.mask)
					this.pxnElement.setMask(mask.mask)
					
					this.setAnnotations(annotations_input);

					this.updateModelAnnotations()
					break;
			}
			// copy shapes_in (from python) to shapes and trigger change on shapes
			
	    }
	    else{ 
	    //  	console.log("vide");
	   }
  	}

	// private _onShapesChanged() {
	// 	//console.log("_onShapesChanged",this.pxnElement.shapes);
	// }
	// private _onSelectedShapeIdsChanged() {
	// 	//console.log("_onSelectedShapeIdsChanged",this.pxnElement.selectedShapeIds);
	// }

  	private callback_create(evt:any){
  		const pxn_element_type= this.model.get('element');
		const newObject = evt.detail;
		let shapes;
		console.log("callback_create",newObject)
		switch (pxn_element_type) {
			case 'pxn-classification':
				/* nothing to do */
				break;
			case 'pxn-keypoints':
			case 'pxn-rectangle': 
			case 'pxn-polygon':
			case 'pxn-cuboid-editor':
				if (this.attributePicker.defaultValue.category===undefined ){
					//console.log("attributePicker.defaultValue UNDEFINED")
					// console.log(this.attributePicker._getList()[0])
					this.attributePicker.setCategory(this.attributePicker._getList()[0])
	   				// console.log(this.attributePicker.defaultValue)
				}
				// console.log("this.attributePicker.defaultValue",this.attributePicker.defaultValue)
				newObject.id = Math.random().toString(36);// TODO: temporary: id not set in all plugins
				// add attributes to object without deep copy
				Object.entries(this.attributePicker.defaultValue).forEach(([key, value]) => {
					newObject[key] = JSON.parse(JSON.stringify(value));
				});
				newObject.color = this.attributePicker._colorFor(newObject.category);
				// add timestamp to object
				// set new shapes
				shapes = [...this.pxnElement.shapes].map(({color, ...s}) => s);
				
				this.setAnnotations(shapes);
				this.updateModelAnnotations()
				
				// this.model.set("shapes",JSON.parse(JSON.stringify([...shapes]))); 
				// this.model.set("shapes_in",['-']);

				//this.touch();
				break;
			case 'pxn-smart-rectangle':
				newObject.id = Math.random().toString(36);// TODO: temporary: id not set in all plugins
				// add attributes to object without deep copy
				Object.entries(this.attributePicker.defaultValue).forEach(([key, value]) => {
					// do not overwrite category if it was automatically found
					if (key != 'category' || !newObject.category) {
						newObject[key] = JSON.parse(JSON.stringify(value));
					}
				});
				newObject.color = this.attributePicker._colorFor(newObject.category);
				// add timestamp to object
				
				shapes = [...this.pxnElement.shapes].map(({color, ...s}) => s);
				this.setAnnotations(shapes);
				this.updateModelAnnotations()

				// this.model.set("shapes",JSON.parse(JSON.stringify([...shapes]))); 
				// this.model.set("shapes_in",['-']);
				// this.touch();

				break;
			case 'pxn-segmentation':
			case 'pxn-smart-segmentation':
				this.updateModelAnnotations()
				break;
			case 'tracking':
			case 'tracking-graph':
			case 'smart-tracking':
				/* nothing to do: create=update */
				break;
			default:
				console.error("onCreate: unknown");
		}


	  //   console.log("callback_create -------------------------");
	  //   if (this.model.get("element")==="pxn-segmentation" || this.model.get("element")==="pxn-smart-segmentation") { 
			// const mask=this.pxnElement.getMask();
			// console.log("get mask");
			// this.model.set("mask",mask);
			// this.touch()
	  //   } 
	  //   else {
   
			// const newObj = evt.detail;

			// if (this.attributePicker) {
			// 	//console.log("this.attributePicker.defaultValue",this.attributePicker.defaultValue)
			// 	Object.entries(this.attributePicker.defaultValue).forEach(([key, value]) => {
			// 		if (key && value) newObj[key] = JSON.parse(JSON.stringify(value));
			// 	}); 
			// 	newObj.color = this.attributePicker._colorFor(newObj.category);
			// 	//console.log("newObj.color",newObj.color);
			// 	//console.log("create",newObj);
			// }
			// // const cat=this.model.get("current_category");

			// // if (cat!=='') {
			// //   newObj.category=cat;
			// //   const mycat_colors=this.model.get('categories_colors');
			// //   if (cat in mycat_colors) newObj.color=mycat_colors[cat];
			// // }


			// //console.log(this.model.get('categories_colors'));

			// this.model.set("shapes",JSON.parse(JSON.stringify([...this.pxnElement.shapes]))); 
			// this.model.set("shapes_in",['-']);

			// this.touch();

			// }
    	console.log("----------------------------------------");

  	}

	private callback_update(evt:any){
		console.log("callback_update");

		const pxn_element_type= this.model.get('element');
		let shapes;
		switch (pxn_element_type) {
			case 'pxn-classification':
			case 'pxn-keypoints':
			case 'pxn-rectangle':
			case 'pxn-smart-rectangle':
			case 'pxn-polygon':
			case 'pxn-cuboid-editor':
				shapes = [...this.pxnElement.shapes].map(({color, ...s}) => s);
				this.setAnnotations(shapes);
				this.updateModelAnnotations()
				this.updateModelSelectedIds()
				break;
			case 'pxn-segmentation':
			case 'pxn-smart-segmentation':
				const updatedIds = evt.detail;
				let frame = this.annotations;
				// 1) update the mask (always id 0)
				let mask:any = frame.find((l:any) => l.id === 0);
				if (!mask) {
					mask = {id: 0, mask: this.pxnElement.getMask()};//if the mask already exists => just overwrite the previous mask
					frame.push(mask as never);//otherwise(first time), create it
				} else {
					mask.mask = this.pxnElement.getMask();
				}
				// 2) update annotation info when needed
				let label:any = frame.find((l:any) => l.id === JSON.stringify(updatedIds));// search the corresponding id
				if (label) {//id exists in the database, update information
					// nothing to do for annotation infos, only the mask has changed
				} else {// this is a new id
					// create the new label
					label = {...this.attributePicker.defaultValue};
					// store the stringified values
					const value = this.attributePicker.value;
					Object.keys(label).forEach((key) => {
						label[key] = JSON.parse(JSON.stringify(value[key]));
					});
					label.id = JSON.stringify(updatedIds);
					frame.push(label as never)
					// console.log(frame)
				}
				// 3) store the new annotation structure
				this.setAnnotations(frame);
				// selectedId has also changed, update it
				this.setSelectedIds(updatedIds);

				this.updateModelAnnotations()
				this.updateModelSelectedIds()
				break;
			case 'tracking':
			case 'tracking-graph':
			case 'smart-tracking':
				// console.log("evt=",evt);
				// console.log("this.tracks=",this.tracks);
				// this.tracks = evt.detail;
				// console.log("this.tracks2=",this.tracks);
				break;
			default:
				console.error("onUpdate: plugin unknown");
		}


		// if (this.model.get("element")==="pxn-segmentation" || this.model.get("element")==="pxn-smart-segmentation") { 

		// 	const mask=this.pxnElement.getMask();
		// 	console.log("get mask");
		// 	this.model.set("mask",mask);
		// 	this.touch()
		// } else {

		// 	const shapes=JSON.parse(JSON.stringify([...this.pxnElement.shapes]));//shapes));
		// 	this.model.set("shapes",shapes);
		// 	this.model.set("shapes_in",['-']);
		// 	//console.log(shapes);
		// 	// console.log(this.pxnElement.renderer.renderer.plugins.extract.image().src)
		// 	// this.model.set("image_src",this.pxnElement.renderer.renderer.plugins.extract.image(this.pxnElement.renderer.stage).src)

		// 	// this.el.appendChild(this.pxnElement.renderer.renderer.plugins.extract.image(this.pxnElement.renderer.stage))
		// 	this.touch();
		// }
	}
 
	private callback_delete(evt:any){
		console.log("callback_delete");
		this.setSelectedIds([]);
		this.updateModelSelectedIds()
		const pxn_element_type= this.model.get('element');
		let shapes;
		switch (pxn_element_type) {
			case 'pxn-classification':
				/* nothing to do */
				break;
			case 'pxn-keypoints':
			case 'pxn-rectangle':
			case 'pxn-smart-rectangle':
			case 'pxn-polygon':
			case 'pxn-cuboid-editor':
				shapes = [...this.pxnElement.shapes].map(({color, ...s}) => s);
				this.setAnnotations(shapes);
				this.updateModelAnnotations()

				break;
			case 'pxn-segmentation':
			case 'pxn-smart-segmentation':
				const ids = evt.detail;
				let frame:any = this.annotations;
				// 1) update the mask (always id 0)
				// get the new mask and store it
				let mask:any = frame.find((l:any) => l.id === 0);
				if (mask) mask.mask = this.pxnElement.getMask();//just overwrite the previous mask
				// 2) update annotation info (= delete corresponding id)
				frame = frame.filter((l:any) => l.id !== JSON.stringify(ids))
				// 3) store the new annotation structure
				this.setAnnotations(frame);
				this.updateModelAnnotations()

				break;
			case 'tracking':
			case 'tracking-graph':
			case 'smart-tracking':
				/* nothing to do: delete=update */
				break;
			default:
				console.error("onDelete: plugin ${this.chosenPlugin} unknown");
		}

		// if (this.model.get("element")==="pxn-segmentation" || this.model.get("element")==="pxn-smart-segmentation") { 
		// 	const mask=this.pxnElement.getMask();
		// 	console.log("get mask");
		// 	this.model.set("mask",mask);
		// 	this.touch()
		// }
		// else{ 

		// 	this.model.set("shapes",JSON.parse(JSON.stringify([...this.pxnElement.shapes])));
		// 	this.model.set("shapes_in",['-']);
		// 	this.touch();
		// }

	} 
 
	private callback_select(evt:any) {
		console.log("onSelection");
		const pxn_element_type= this.model.get('element');
		switch (pxn_element_type) {
			case 'classification':
				/* nothing to do */
				break;
			case 'pxn-keypoints':
			case 'pxn-rectangle':
			case 'pxn-smart-rectangle':
			case 'pxn-polygon':
				this.setSelectedIds(evt.detail);
				if (this.selectedIds && this.selectedIds.length) {
					const shapes = this.annotations.filter((s:any) => this.selectedIds.includes(s.id as never));
					const common = commonJson(shapes);
					this.attributePicker.setAttributes(common);
					
				}
				this.updateModelSelectedIds()

				break;
			case 'pxn-segmentation':
			case 'pxn-smart-segmentation':
				this.setSelectedIds(evt.detail);
				if (this.selectedIds) {//only one id at a time for segmentation
					//console.log(this.selectedIds)
					//console.log(this.annotations)
					const annot = this.annotations.filter((a:any) => JSON.stringify(this.selectedIds)===(a.id));// search the corresponding id 
					//console.log(annot)

					const common = commonJson(annot);
					this.attributePicker.setAttributes(common);
				} else {
					// if null, nothing is selected
					this.setSelectedIds([]);
				}
				this.updateModelSelectedIds()
				break;

			case 'pxn-cuboid-editor':
				this.setSelectedIds(evt.detail.map((p:any) => p.id));
				if (this.selectedIds && this.selectedIds.length) {
					const shapes = this.annotations.filter((s:any) => this.selectedIds.includes(s.id as never));
					const common = commonJson(shapes);
					this.attributePicker.setAttributes(common);

				}
				this.updateModelSelectedIds()

				break;
			case 'tracking':
			case 'tracking-graph':
			case 'smart-tracking':
				/* nothing to do */
				break;
			default:
				console.error(`onSelection: plugin  unknown`);
		}



		// if (this.model.get("element")==="pxn-segmentation" || this.model.get("element")==="pxn-smart-segmentation") { 
		// 	console.log("segmentation ...")
		// 	console.log(this.pxnElement.selectedId);
		// 	console.log(this.pxnElement.targetClass);
		// 	this.selectedIds = evt.detail;
		// 		if (this.selectedIds) {//only one id at a time for segmentation
		// 			const annot = this.annotations.filter((a:any) => JSON.stringify(this.selectedIds)===a.id as never);// search the corresponding id 
		// 			const common = commonJson(annot);
		// 			this.attributePicker.setAttributes(common);
		// 		} else {
		// 			// if null, nothing is selected
		// 			this.selectedIds = []
		// 		}
		// }
		// else{
		// 	this.selectedIds = evt.detail;
		// 	this.updateDisplayOfSelectedProperties();

		// 	console.log("callback_select",this.pxnElement.selectedShapeIds);
		// 	this.model.set("selectedShapeIds",JSON.parse(JSON.stringify([...this.pxnElement.selectedShapeIds])));
		// 	this.touch();
		// }
	}

	// private updateDisplayOfSelectedProperties() {
	// 	if (this.selectedIds && this.selectedIds.length) {
	// 		const shapes = [...this.pxnElement.shapes].filter((s:any) => this.selectedIds.includes(s.id as never));
	// 		//console.log("updateDisplayOfSelectedProperties shapes",shapes)
	// 		const common = commonJson(shapes);
	// 		//console.log("updateDisplayOfSelectedProperties common ",common)

	// 		if (this.attributePicker) this.attributePicker.setAttributes(common);
	// 	}
	// }

}








    ////@ts-ignore 
    // const pp=right_panel.querySelector("main");// childNodes;//  getElementById("#pencil");
    // console.log(right_panel);
    // console.log(pp);
   // for (let i = 0; i < right_panel.childNodes.length; i++) {
   //  console.log(right_panel.childNodes[i]);
   //  }

    // const right = document.createElement('div');
    // right.className="right-panel";
    
    // const icons = document.createElement('div');
    // icons.className="icons";

    // const edit=document.createElement('p');
    // edit.className='icon';
    // edit.title="Add polygon";
    // const e=document.importNode(createPencil.getTemplateElement().content,true);
    // edit.appendChild(e);
    // edit.addEventListener("click",() => { console.log("create"); this.pxnElement.mode = 'create';}) 
    // icons.appendChild(edit);

    // const zoom=document.createElement('p');
    // zoom.className='icon';
    // zoom.title="zoomIn";
    // const z=document.importNode(zoomIn.getTemplateElement().content,true);
    // zoom.appendChild(z);
    // zoom.addEventListener("click",() => { console.log("zooooommm");}) 
    // icons.appendChild(zoom);


    // right.appendChild(icons);
    // main.appendChild(right);





   //console.log(right_panel.querySelector("main"));


    // const panel=document.createElement('div');

    // const button_create=document.createElement('button');
    // button_create.textContent="create"
    // button_create.addEventListener("click",() => { this.pxnElement.mode = 'create';})
    // panel.appendChild(button_create);

    // const button_edit=document.createElement('button');
    // button_edit.textContent="edit"
    // button_edit.addEventListener("click",() => { this.pxnElement.mode = 'edit';})
    // panel.appendChild(button_edit);

    // this.el.appendChild(panel);
 //document.importNode(zoomIn.getTemplateElement().content,true);
    // const createPencil_content=createPencil.getTemplateElement().content
    // const pointer_content= pointer.getTemplateElement().content
    // const right_html=html`
    //   <div class="right-panel">
        
    //     <div id=icons class="icons">
    //       <p id="edit"   class="icon" title="Edit"> ${pointer}</p>
    //       <p id="pencil"   class="icon" title="Add Shape"> ${polyline}</p>
    //     </div>
    //   </div>
    // `;
    // const right_content=right_html.getTemplateElement().content;
    
    // const pencil=right_content.getElementById("pencil");
    // if (pencil !==null) {
    //    pencil.appendChild(createPencil_content);
    //    pencil.addEventListener("click",() => { console.log("pencil"); this.pxnElement.mode = 'create';})
    // }
    // const edit=right_content.getElementById("edit");
    // if (edit !==null) {
    //    edit.appendChild(pointer_content);
    //    edit.addEventListener("click",() => { console.log("edit"); this.pxnElement.mode = 'edit';})
    // }

    // if (pxn_el==='pxn-segmentation'){
    //   const brush_elem=document.createElement('p');
    //   brush_elem.className='icon';
    //   brush_elem.title="Brush";
    //   brush_elem.appendChild(brush.getTemplateElement().content);
    //   brush_elem.addEventListener("click",() => { console.log("brush"); this.pxnElement.mode = 'create-brush';}) 
    //   //@ts-ignore
    //   right_content.getElementById("icons").appendChild(brush_elem);

    //   const Remove_elem=document.createElement('p');
    //   Remove_elem.className='icon';
    //   Remove_elem.title="Remove to instance";
    //   Remove_elem.appendChild(subtract.getTemplateElement().content);
    //   Remove_elem.addEventListener("click",() => { console.log("subtract"); this.pxnElement.editionMode=EditionMode.REMOVE_FROM_INSTANCE;}) 
    //   //@ts-ignore
    //   right_content.getElementById("icons").appendChild(Remove_elem);


    //   const union_elem=document.createElement('p');
    //   union_elem.className='icon';
    //   union_elem.title="Add to instance";
    //   union_elem.appendChild(union.getTemplateElement().content);
    //   union_elem.addEventListener("click",() => { console.log("union"); this.pxnElement.editionMode=EditionMode.ADD_TO_INSTANCE;}) 
    //   //@ts-ignore
    //   right_content.getElementById("icons").appendChild(union_elem);

      
    // } 
    // right_content.appendChild(edit);