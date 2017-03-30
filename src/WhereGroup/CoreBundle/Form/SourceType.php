<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

class SourceType extends AbstractType
{

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('slug', TextType::class, array('label' => 'Slug'))
            ->add('name', TextType::class, array('label' => 'Name'))
            ->add('description', TextareaType::class, array(
                'label'    => 'Beschreibung',
                'required' => false
            ))
            ->add('system', CheckboxType::class, array(
                'label'    => 'System',
                'required' => false,
            ));
    }

    /**
     * @param OptionsResolver $resolver
     */
//    public function configureOptions(OptionsResolver $resolver)
//    {
//        $resolver->setDefaults(array(
//            'data_class' => 'WhereGroup\UserBundle\Entity\Group'
//        ));
//    }

    /**
     * @return string
     */
//    public function getName()
//    {
//        return 'metador_userbundle_grouptype';
//    }
}
