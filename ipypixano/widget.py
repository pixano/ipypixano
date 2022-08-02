#!/usr/bin/env python
# coding: utf-8

# Copyright (c) nicolas allezard.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""


from ipywidgets import DOMWidget, ValueWidget, register
from traitlets import Unicode, Bool, validate, TraitError,Int,List,Dict,Bytes,Any
from ipywidgets.widgets.trait_types import (
    bytes_serialization,
    _color_names,
    _color_hex_re,
    _color_hexa_re,
    _color_rgbhsl_re,
)
from ._frontend import module_name, module_version


import numpy as np
import base64
import cv2
import copy
import json

from pathlib import Path
from urllib.request import urlopen
from PIL import Image
import io

def readb64(uri):
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    return img

def writeb64(img):
    """Encode matrix to base64 image string"""
    retval, buffer = cv2.imencode('.png', img)
    pic_str = base64.b64encode(buffer)
    pic_str = pic_str.decode()
    return pic_str


@register
class Pixano(DOMWidget, ValueWidget):
    _model_name = Unicode('PixanoModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)

    _view_name = Unicode('PixanoView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    element=Unicode('').tag(sync=True)

    image= Any().tag(sync=True) 
    image_src= Unicode('').tag(sync=True) 

    mode=Unicode('none').tag(sync=True)

    # shapes_in=List([]).tag(sync=True)
    # shapes=List([]).tag(sync=True)
    # selectedShapeIds=List([]).tag(sync=True)
    
    annotations_input=List([]).tag(sync=True)
    annotations=List([]).tag(sync=True)
    selectedIds=List([]).tag(sync=True)
    


    current_category=Unicode('').tag(sync=True)
    categories_colors=Dict().tag(sync=True)

    
    # mask=Unicode('').tag(sync=True)
    # targetClass=Int(1).tag(sync=True)
    # clsMap=Dict().tag(sync=True)
    maskVisuMode=Unicode('INSTANCE').tag(sync=True)

    label_schema=Dict().tag(sync=True)




    @validate('element')
    def _valid_element(self, proposal):
        valid_elem=["pxn-rectangle","pxn-segmentation","pxn-smart-rectangle","pxn-smart-segmentation","pxn-polygon",'pxn-graph']
        #print("element",proposal["value"])
        if not proposal['value'] in valid_elem:
            raise TraitError('Invalid element: must be one of '+",".join(valid_elem))
        return proposal["value"]


    @validate('image')
    def _valid_image(self, proposal):
        #print(type(proposal['value']))
        if isinstance(proposal['value'], str):
            #print("string")
            filename=proposal['value']
            if 'http' in filename:
                data=urlopen(filename).read()
                data = base64.b64encode(data).decode()
            else:
                abs_filename=Path(filename).absolute().as_posix()
                #print(abs_filename)

                data=urlopen("file://"+abs_filename).read()
                data = base64.b64encode(data).decode()
            return data
        elif str(type(proposal['value']))== "<class 'numpy.ndarray'>" :
            #print("array")
            img_b64=writeb64(proposal['value'])
            return img_b64
            
        elif isinstance(proposal['value'],Image.Image):
            #print("pil image")
            img_byte_arr = io.BytesIO()
            proposal['value'].save(img_byte_arr, format='PNG')
            return base64.b64encode(img_byte_arr.getvalue()).decode()
        else:
            raise TraitError('Invalid type: get '+str(type(proposal['value']))+", must be a string, a numpy ndarray or a PIL image " )
        return None

    def getMask(self):

        if self.annotations is None or len(self.annotations)==0 : return None

        annotation=self.annotations[0]

        if 'mask' in annotation and annotation['mask']!= None:
            img=readb64(annotation['mask'])
            return img
        else:
            return None

    def setMask(self,mask,infos):
        annotationsnew=[{'id': 0,'mask':"data:image/png;base64,"+writeb64(mask)},*infos ]
        self.annotations_input=annotationsnew

    def getSegmentationInfos(self):
        if "segmentation" in self.element and len(self.annotations)>0:
            return self.annotations[1:]
        else :
            return None

    def save(self,filename):
        with open(filename,"w") as f:
            json.dump(self.annotations,f,indent=True)

    def load(self,filename):
        with open(filename,"r") as f:
            annotations=json.load(f)
            if annotations is not None : self.setAnnotations(annotations)

    def clearAnnotations(self):
        #print("python in",self.shapes_in)
        self.annotations_input=copy.deepcopy(['-'])

    def setAnnotations(self,new_annotations=[]):
        self.annotations_input=copy.deepcopy(new_annotations)